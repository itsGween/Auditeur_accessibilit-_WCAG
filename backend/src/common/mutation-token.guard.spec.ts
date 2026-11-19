import { ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MutationTokenGuard,
  PLACEHOLDER_TOKEN,
  extractBearerToken,
  tokensMatch,
} from './mutation-token.guard';

const SECRET = 's3cr3t-token-for-tests';

function buildGuard(env: Record<string, string | undefined>): MutationTokenGuard {
  const config = { get: (key: string) => env[key] } as unknown as ConfigService;
  return new MutationTokenGuard(config);
}

function contextFor(method: string, authorization?: string): ExecutionContext {
  const request = { method, headers: authorization === undefined ? {} : { authorization } };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('MutationTokenGuard', () => {
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when MUTATION_API_TOKEN is configured', () => {
    const guard = (): MutationTokenGuard => buildGuard({ MUTATION_API_TOKEN: SECRET });

    it('rejects a POST without an Authorization header (401)', () => {
      expect(() => guard().canActivate(contextFor('POST'))).toThrow(UnauthorizedException);
    });

    it('rejects a POST with the wrong token (401)', () => {
      expect(() => guard().canActivate(contextFor('POST', 'Bearer wrong-token'))).toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a token sent with another scheme than Bearer', () => {
      expect(() => guard().canActivate(contextFor('POST', `Basic ${SECRET}`))).toThrow(
        UnauthorizedException,
      );
    });

    it('accepts a POST with the right token', () => {
      expect(guard().canActivate(contextFor('POST', `Bearer ${SECRET}`))).toBe(true);
    });

    it('accepts the Bearer scheme case-insensitively', () => {
      expect(guard().canActivate(contextFor('POST', `bearer ${SECRET}`))).toBe(true);
    });

    it.each(['PUT', 'PATCH', 'DELETE'])('also protects %s', (method) => {
      expect(() => guard().canActivate(contextFor(method))).toThrow(UnauthorizedException);
    });

    it.each(['GET', 'HEAD', 'OPTIONS'])('leaves %s public without a token', (method) => {
      expect(guard().canActivate(contextFor(method))).toBe(true);
    });

    it('does not log a warning for a real (non-placeholder) token', () => {
      guard();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('when MUTATION_API_TOKEN is absent or empty', () => {
    it('leaves mutations open in development and warns at startup (variable absent)', () => {
      const guard = buildGuard({});
      expect(guard.canActivate(contextFor('POST'))).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('OUVERTES sans jeton'));
    });

    it('treats an empty or whitespace-only variable like an absent one', () => {
      const guard = buildGuard({ MUTATION_API_TOKEN: '   ' });
      expect(guard.canActivate(contextFor('POST'))).toBe(true);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('fails closed in production: mutations are refused and an error is logged', () => {
      const guard = buildGuard({ NODE_ENV: 'production' });
      expect(() => guard.canActivate(contextFor('POST'))).toThrow(UnauthorizedException);
      expect(guard.canActivate(contextFor('GET'))).toBe(true);
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('en production'));
    });
  });

  it('warns when the token is still the placeholder value, but still enforces it', () => {
    const guard = buildGuard({ MUTATION_API_TOKEN: PLACEHOLDER_TOKEN });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('valeur d'));
    expect(guard.canActivate(contextFor('POST', `Bearer ${PLACEHOLDER_TOKEN}`))).toBe(true);
    expect(() => guard.canActivate(contextFor('POST'))).toThrow(UnauthorizedException);
  });
});

describe('tokensMatch', () => {
  it('returns true for identical tokens', () => {
    expect(tokensMatch(SECRET, SECRET)).toBe(true);
  });

  it('returns false for tokens of different lengths without throwing', () => {
    expect(tokensMatch('short', SECRET)).toBe(false);
  });

  it('returns false for same-length tokens that differ by one character', () => {
    expect(tokensMatch(`${SECRET.slice(0, -1)}X`, SECRET)).toBe(false);
  });
});

describe('extractBearerToken', () => {
  it.each([
    [undefined, null],
    ['', null],
    ['Bearer', null],
    ['Bearer ', null],
    ['Basic abc', null],
    ['Bearer abc def', null],
    ['Bearer abc', 'abc'],
    ['  Bearer   abc  ', 'abc'],
  ])('parses %p as %p', (header, expected) => {
    expect(extractBearerToken(header)).toBe(expected);
  });
});
