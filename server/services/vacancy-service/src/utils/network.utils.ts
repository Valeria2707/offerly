import {
  BadRequestException,
  UnprocessableEntityException
} from '@nestjs/common';
import { LookupAddress } from 'node:dns';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import {
  BLOCKED_IPV4_FIRST_OCTETS,
  BLOCKED_IPV4_PREFIXES,
  BLOCKED_IPV6_ADDRESSES,
  BLOCKED_IPV6_PREFIXES
} from './network.constants';

function isPrivateIpv4(address: string): boolean {
  const [firstOctet, secondOctet] = address.split('.').map(Number);
  if (BLOCKED_IPV4_FIRST_OCTETS.includes(firstOctet)) return true;
  if (firstOctet >= 224) return true;
  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) return true;
  return BLOCKED_IPV4_PREFIXES.some((prefix) => address.startsWith(prefix));
}

export function isPublicIp(address: string): boolean {
  if (isIP(address) === 4) return !isPrivateIpv4(address);
  if (isIP(address) !== 6) return false;
  const normalized = address.toLowerCase();
  if (BLOCKED_IPV6_ADDRESSES.includes(normalized)) return false;
  return !BLOCKED_IPV6_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new BadRequestException(
      'Only public HTTP(S) vacancy URLs are allowed'
    );
  let addresses: LookupAddress[];
  try {
    addresses = await lookup(url.hostname, { all: true });
  } catch {
    throw new UnprocessableEntityException(
      'The vacancy URL hostname could not be resolved'
    );
  }
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicIp(address))
  )
    throw new BadRequestException(
      'Private or local vacancy URLs are not allowed'
    );
  return url;
}

export async function readLimitedResponseBody(
  response: Response,
  maxBytes: number
): Promise<string> {
  if (!response.body)
    throw new UnprocessableEntityException(
      'The vacancy page returned an empty response'
    );
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      await reader.cancel();
      throw new BadRequestException('The vacancy page is too large');
    }
    body += decoder.decode(value, { stream: true });
  }
  return body + decoder.decode();
}
