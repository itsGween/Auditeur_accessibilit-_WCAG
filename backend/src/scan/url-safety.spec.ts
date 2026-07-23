import { promises as dnsPromises } from 'node:dns';
import { isPrivateOrReservedIp, assertPublicHttpUrl } from './url-safety';

jest.mock('node:dns', () => ({
  promises: {
    lookup: jest.fn(),
  },
}));

const dnsMock = dnsPromises as unknown as { lookup: jest.Mock };

describe('isPrivateOrReservedIp', () => {
  it.each([
    ['10.0.0.1', true],
    ['10.255.255.255', true],
    ['172.16.0.1', true],
    ['172.31.255.255', true],
    ['192.168.1.1', true],
    ['127.0.0.1', true],
    ['169.254.1.1', true],
    ['100.64.0.1', true],
    ['0.0.0.0', true],
    ['224.0.0.1', true],
  ])('flags %s as private/reserved', (ip, expected) => {
    expect(isPrivateOrReservedIp(ip)).toBe(expected);
  });

  it.each([
    ['8.8.8.8', false],
    ['93.184.216.34', false],
    ['1.1.1.1', false],
    ['172.15.255.255', false],
    ['172.32.0.0', false],
  ])('allows public IPv4 %s', (ip, expected) => {
    expect(isPrivateOrReservedIp(ip)).toBe(expected);
  });

  it.each([
    ['::1', true],
    ['fc00::1', true],
    ['fd12:3456:789a::1', true],
    ['fe80::1', true],
    ['::ffff:127.0.0.1', true],
  ])('flags IPv6 %s as private/reserved', (ip, expected) => {
    expect(isPrivateOrReservedIp(ip)).toBe(expected);
  });

  it('allows a public IPv6 address', () => {
    expect(isPrivateOrReservedIp('2606:4700:4700::1111')).toBe(false);
  });

  it('treats an unparseable string as unsafe by default', () => {
    expect(isPrivateOrReservedIp('not-an-ip')).toBe(true);
  });
});

describe('assertPublicHttpUrl', () => {
  beforeEach(() => {
    dnsMock.lookup.mockReset();
  });

  it('rejects non-http(s) protocols before doing any DNS lookup', async () => {
    await expect(assertPublicHttpUrl('ftp://example.com')).rejects.toThrow(
      'Seuls les protocoles http et https sont acceptés',
    );
    expect(dnsMock.lookup).not.toHaveBeenCalled();
  });

  it('rejects a malformed URL', async () => {
    await expect(assertPublicHttpUrl('not a url')).rejects.toThrow('URL invalide');
  });

  it('rejects when the hostname resolves to a private address', async () => {
    dnsMock.lookup.mockResolvedValue([{ address: '127.0.0.1', family: 4 }]);
    await expect(assertPublicHttpUrl('http://localhost')).rejects.toThrow(
      "L'URL cible une adresse privée, locale ou réservée",
    );
  });

  it('rejects when DNS resolution fails', async () => {
    dnsMock.lookup.mockRejectedValue(new Error('ENOTFOUND'));
    await expect(assertPublicHttpUrl('https://does-not-exist.invalid')).rejects.toThrow(
      "Impossible de résoudre l'hôte",
    );
  });

  it('allows a URL that resolves to a public address', async () => {
    dnsMock.lookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
    await expect(assertPublicHttpUrl('https://example.com')).resolves.toBeUndefined();
  });
});
