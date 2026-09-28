import { isPublicIp } from '../src/utils/network.utils';

describe('isPublicIp', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.1.1',
    '0.0.0.0',
    '224.0.0.1',
    '172.31.255.255',
    '::',
    '::1',
    'fd00::1',
    'FC00::1',
    'fe80::1',
    'fe90::1',
    'fea0::1',
    'feb0::1',
    '::ffff:127.0.0.1',
    '::ffff:10.1.2.3',
    '::ffff:192.168.1.1',
    'invalid-address'
  ])('rejects private or local address %s', (address) =>
    expect(isPublicIp(address)).toBe(false)
  );
  it.each([
    '8.8.8.8',
    '1.1.1.1',
    '172.15.255.255',
    '172.32.0.1',
    '2606:4700:4700::1111',
    '::ffff:8.8.8.8'
  ])('allows public address %s', (address) =>
    expect(isPublicIp(address)).toBe(true)
  );
});
