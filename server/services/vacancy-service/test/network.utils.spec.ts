import { isPublicIp } from '../src/utils/network.utils';

describe('isPublicIp', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.1.1',
    '::1',
    'fd00::1'
  ])('rejects private or local address %s', (address) =>
    expect(isPublicIp(address)).toBe(false)
  );
  it.each(['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111'])(
    'allows public address %s',
    (address) => expect(isPublicIp(address)).toBe(true)
  );
});
