import { BadRequestException } from '@nestjs/common';

/**
 * Normalizes a submitted URL so the same page always maps to the same Site row (and therefore
 * to a single history / trend chart):
 * - surrounding whitespace trimmed;
 * - scheme and host lowercased, default port dropped (both done by the WHATWG URL parser);
 * - fragment (#...) removed: it never reaches the server, so it can't change the scanned page;
 * - the lone trailing slash of a bare domain removed ("https://x.com/" → "https://x.com"), which
 *   also matches how URLs were typed and stored before this normalization existed.
 *
 * The path and query string are kept as-is: they are case-sensitive and can select a different
 * page, so "normalizing" them would merge histories that aren't actually the same page.
 */
export function normalizeSiteUrl(rawUrl: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new BadRequestException(`URL invalide : ${rawUrl}`);
  }

  parsed.hash = '';
  const href = parsed.href;
  if (parsed.pathname === '/' && parsed.search === '') {
    return href.replace(/\/$/, '');
  }
  return href;
}
