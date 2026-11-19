import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

/** HTTP methods that change server state and therefore require the token. */
const MUTATION_METHODS: ReadonlySet<string> = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Placeholder value shipped in .env.example / docker-compose.yml: must be replaced before any public deployment. */
export const PLACEHOLDER_TOKEN = 'change-me';

/**
 * Compares two tokens in constant time. Both values are hashed to a fixed-length SHA-256 digest
 * first, because `timingSafeEqual` throws on buffers of different lengths — comparing lengths
 * up front would otherwise leak the expected token's length through timing.
 */
export function tokensMatch(provided: string, expected: string): boolean {
  const providedDigest = createHash('sha256').update(provided, 'utf8').digest();
  const expectedDigest = createHash('sha256').update(expected, 'utf8').digest();
  return timingSafeEqual(providedDigest, expectedDigest);
}

/** Extracts the token from an `Authorization: Bearer <token>` header, or null if absent/malformed. */
export function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

/**
 * Minimal guard for state-changing routes (POST, PUT, PATCH, DELETE), registered globally in
 * AppModule. GET/HEAD/OPTIONS stay public. This is a single shared secret, not user
 * authentication: full multi-user auth and RBAC are out of scope for the MVP (CLAUDE.md §5).
 *
 * - MUTATION_API_TOKEN set: requests must send `Authorization: Bearer <token>`, otherwise 401.
 * - MUTATION_API_TOKEN empty/absent outside production: mutations stay open (local dev), with a
 *   startup warning.
 * - MUTATION_API_TOKEN empty/absent with NODE_ENV=production: mutations are refused (fail closed),
 *   so a forgotten variable never silently exposes a public deployment.
 */
@Injectable()
export class MutationTokenGuard implements CanActivate {
  private readonly logger = new Logger(MutationTokenGuard.name);
  private readonly expectedToken: string | null;
  private readonly isProduction: boolean;

  constructor(config: ConfigService) {
    const configured = config.get<string>('MUTATION_API_TOKEN')?.trim();
    this.expectedToken = configured ? configured : null;
    this.isProduction = config.get<string>('NODE_ENV') === 'production';
    this.logStartupStatus();
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (!MUTATION_METHODS.has(request.method.toUpperCase())) {
      return true;
    }

    if (this.expectedToken === null) {
      if (this.isProduction) {
        throw new UnauthorizedException(
          "Les routes de modification sont désactivées : MUTATION_API_TOKEN n'est pas configuré sur le serveur",
        );
      }
      return true;
    }

    const provided = extractBearerToken(request.headers.authorization);
    if (provided === null || !tokensMatch(provided, this.expectedToken)) {
      throw new UnauthorizedException("Jeton d'accès manquant ou invalide");
    }
    return true;
  }

  private logStartupStatus(): void {
    if (this.expectedToken === null) {
      if (this.isProduction) {
        this.logger.error(
          'MUTATION_API_TOKEN est vide ou absent en production : toutes les routes POST/PUT/PATCH/DELETE seront refusées (401).',
        );
      } else {
        this.logger.warn(
          'MUTATION_API_TOKEN est vide ou absent : les routes POST/PUT/PATCH/DELETE sont OUVERTES sans jeton. Acceptable en développement local seulement.',
        );
      }
      return;
    }
    if (this.expectedToken === PLACEHOLDER_TOKEN) {
      this.logger.warn(
        `MUTATION_API_TOKEN vaut la valeur d'exemple « ${PLACEHOLDER_TOKEN} » : remplacez-la par un jeton aléatoire avant tout déploiement public.`,
      );
    }
  }
}
