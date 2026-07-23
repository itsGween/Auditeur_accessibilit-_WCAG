import { BadRequestException } from '@nestjs/common';
import { isIPv4, isIPv6 } from 'node:net';
import { promises as dns } from 'node:dns';

/**
 * Blocks the private/loopback/link-local/reserved IPv4 ranges an SSRF attempt would target.
 * Ranges: RFC 1918 private space, loopback, link-local, CGNAT, multicast, and reserved.
 */
function isPrivateOrReservedIPv4(ip: string): boolean {
  const octets = ip.split('.').map(Number);
  if (octets.length !== 4 || octets.some((n) => Number.isNaN(n))) {
    return true;
  }
  const [a, b] = octets;

  if (a === 0) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0) return true;
  if (a >= 224) return true;

  return false;
}

/**
 * Blocks loopback, unspecified, unique-local (ULA), and link-local IPv6 ranges.
 */
function isPrivateOrReservedIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9')) return true;
  if (normalized.startsWith('fea') || normalized.startsWith('feb')) return true;

  const mappedV4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedV4) {
    return isPrivateOrReservedIPv4(mappedV4[1]);
  }

  return false;
}

export function isPrivateOrReservedIp(ip: string): boolean {
  if (isIPv4(ip)) return isPrivateOrReservedIPv4(ip);
  if (isIPv6(ip)) return isPrivateOrReservedIPv6(ip);
  return true;
}

/**
 * Validates that a submitted URL is safe to have Playwright navigate to: http(s) only, and
 * resolving to a public IP address. Re-resolves DNS at scan time (rather than trusting the
 * Site.url validation done at creation) since DNS can change between submission and scan —
 * a classic DNS-rebinding SSRF vector.
 */
export async function assertPublicHttpUrl(rawUrl: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new BadRequestException(`URL invalide : ${rawUrl}`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException('Seuls les protocoles http et https sont acceptés');
  }

  let addresses: string[];
  try {
    const results = await dns.lookup(parsed.hostname, { all: true });
    addresses = results.map((r) => r.address);
  } catch {
    throw new BadRequestException(`Impossible de résoudre l'hôte : ${parsed.hostname}`);
  }

  if (addresses.length === 0 || addresses.some((addr) => isPrivateOrReservedIp(addr))) {
    throw new BadRequestException(
      "L'URL cible une adresse privée, locale ou réservée et ne peut pas être scannée",
    );
  }
}
