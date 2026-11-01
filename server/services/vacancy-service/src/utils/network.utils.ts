import {
  BadRequestException,
  UnprocessableEntityException
} from '@nestjs/common';
import { LookupAddress } from 'node:dns';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const IPV4_MAPPED = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i;

function isPrivateIpv4(address: string): boolean {
  const [first, second] = address.split('.').map(Number);
  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    first >= 224
  );
}

export function isPublicIp(address: string): boolean {
  const mapped = IPV4_MAPPED.exec(address);
  if (mapped) return !isPrivateIpv4(mapped[1]);
  if (isIP(address) === 4) return !isPrivateIpv4(address);
  if (isIP(address) !== 6) return false;
  const normalized = address.toLowerCase();
  return (
    normalized !== '::' &&
    normalized !== '::1' &&
    !normalized.startsWith('fc') &&
    !normalized.startsWith('fd') &&
    !normalized.startsWith('fe8') &&
    !normalized.startsWith('fe9') &&
    !normalized.startsWith('fea') &&
    !normalized.startsWith('feb')
  );
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
