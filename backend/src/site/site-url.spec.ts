import { BadRequestException } from '@nestjs/common';
import { normalizeSiteUrl } from './site-url';

describe('normalizeSiteUrl', () => {
  it.each([
    ['https://gweenkangah.pro', 'https://gweenkangah.pro'],
    ['  https://gweenkangah.pro  ', 'https://gweenkangah.pro'],
    ['HTTPS://GweenKangah.PRO', 'https://gweenkangah.pro'],
    ['https://gweenkangah.pro/', 'https://gweenkangah.pro'],
    ['https://gweenkangah.pro/#contact', 'https://gweenkangah.pro'],
    ['https://gweenkangah.pro#', 'https://gweenkangah.pro'],
    ['https://gweenkangah.pro:443/', 'https://gweenkangah.pro'],
    ['http://example.com:80', 'http://example.com'],
  ])('normalizes %p to %p', (input, expected) => {
    expect(normalizeSiteUrl(input)).toBe(expected);
  });

  it('keeps a non-default port', () => {
    expect(normalizeSiteUrl('https://example.com:8443/')).toBe('https://example.com:8443');
  });

  it('keeps the path and its case, since paths are case-sensitive', () => {
    expect(normalizeSiteUrl('https://EXAMPLE.com/About/Team')).toBe(
      'https://example.com/About/Team',
    );
  });

  it('keeps a meaningful trailing slash on a non-root path', () => {
    expect(normalizeSiteUrl('https://example.com/docs/')).toBe('https://example.com/docs/');
  });

  it('keeps the query string but drops the fragment', () => {
    expect(normalizeSiteUrl('https://example.com/search?q=wcag#results')).toBe(
      'https://example.com/search?q=wcag',
    );
  });

  it('treats http and https as different sites', () => {
    expect(normalizeSiteUrl('http://example.com')).not.toBe(
      normalizeSiteUrl('https://example.com'),
    );
  });

  it('gives the same result for equivalent spellings of one URL', () => {
    const variants = [
      'https://example.com',
      'https://example.com/',
      'HTTPS://Example.COM/#top',
      ' https://example.com:443 ',
    ];
    expect(new Set(variants.map(normalizeSiteUrl)).size).toBe(1);
  });

  it('rejects an unparseable URL with a 400', () => {
    expect(() => normalizeSiteUrl('not a url')).toThrow(BadRequestException);
  });
});
