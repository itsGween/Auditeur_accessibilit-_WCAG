# Politique de sécurité

## Portée

Ce dépôt est un projet de portfolio personnel, indépendant de toute infrastructure gouvernementale. Il n'est adossé à aucun programme de récompense (bug bounty) ni à aucune équipe de sécurité dédiée. Cette politique décrit tout de même un processus de divulgation responsable, par bonne pratique et parce que l'outil accepte des URLs fournies par l'utilisateur et effectue des requêtes réseau sortantes (voir la section « Mesures de sécurité déjà en place » ci-dessous).

## Signaler une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité dans ce projet :

1. **Ne créez pas d'issue GitHub publique.**
2. Envoyez les détails par courriel à l'adresse indiquée sur le profil GitHub [github.com/itsGween](https://github.com/itsGween), ou via une [alerte de sécurité privée GitHub](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) sur ce dépôt si cette fonctionnalité est activée.
3. Incluez : une description du problème, les étapes de reproduction, l'impact potentiel, et toute suggestion de correctif si vous en avez une.

## Délai de réponse

Ce projet est maintenu par une seule personne, sur son temps libre. Il n'y a pas de garantie de délai de réponse formel, mais un accusé de réception sera envoyé dès que possible, généralement sous 7 jours.

## Mesures de sécurité déjà en place

Ces éléments sont documentés ici pour transparence, pas comme une invitation à ne pas signaler de contournement trouvé :

- **Validation d'URL** : seuls les protocoles `http` et `https` sont acceptés pour une soumission de scan.
- **Protection SSRF** : l'hôte cible est résolu par DNS au moment du scan (pas seulement à la soumission) et rejeté s'il pointe vers une plage d'adresses privée, locale ou réservée (voir `backend/src/scan/url-safety.ts`).
- **Délai d'exécution** : chaque scan est borné par un délai configurable (`SCAN_TIMEOUT_MS`) pour éviter qu'une page cible bloque indéfiniment le navigateur headless.
- **Validation stricte des entrées** : tous les DTO d'API sont validés via `class-validator`, avec rejet des propriétés non attendues (`forbidNonWhitelisted`).
- **Contenu non fiable échappé** : le HTML extrait des pages scannées (utilisé dans les rapports PDF/CSV) est systématiquement échappé avant d'être réinjecté dans un document généré, puisqu'il provient d'une source externe non fiable.

## Hors de portée

- Les vulnérabilités dans les dépendances tierces (axe-core, Playwright, NestJS, React, le GC Design System, etc.) doivent être signalées directement à leurs mainteneurs respectifs.
- Ce projet n'est pas déployé publiquement de façon permanente; les rapports concernant une instance de démonstration temporaire doivent préciser l'URL exacte concernée.

---

# Security Policy

## Scope

This repository is a personal portfolio project, independent of any government infrastructure. It has no bug bounty program or dedicated security team. This policy still describes a responsible disclosure process, as good practice and because the tool accepts user-supplied URLs and makes outbound network requests (see "Security measures already in place" below).

## Reporting a vulnerability

If you find a security vulnerability in this project:

1. **Do not open a public GitHub issue.**
2. Email the details to the address listed on the [github.com/itsGween](https://github.com/itsGween) GitHub profile, or via a [GitHub private security advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) on this repository if that feature is enabled.
3. Include: a description of the issue, reproduction steps, potential impact, and any suggested fix if you have one.

## Response time

This project is maintained by a single person, in their spare time. There is no formal response-time guarantee, but an acknowledgement will be sent as soon as possible, typically within 7 days.

## Security measures already in place

These are documented here for transparency, not as an invitation to skip reporting a bypass you find:

- **URL validation**: only `http` and `https` protocols are accepted for a scan submission.
- **SSRF protection**: the target host is DNS-resolved at scan time (not just at submission) and rejected if it resolves to a private, local, or reserved address range (see `backend/src/scan/url-safety.ts`).
- **Execution timeout**: every scan is bounded by a configurable timeout (`SCAN_TIMEOUT_MS`) so a target page can't block the headless browser indefinitely.
- **Strict input validation**: all API DTOs are validated via `class-validator`, rejecting unexpected properties (`forbidNonWhitelisted`).
- **Untrusted content is escaped**: HTML extracted from scanned pages (used in PDF/CSV reports) is always escaped before being embedded in a generated document, since it originates from an untrusted external source.

## Out of scope

- Vulnerabilities in third-party dependencies (axe-core, Playwright, NestJS, React, the GC Design System, etc.) should be reported directly to their respective maintainers.
- This project isn't permanently deployed publicly; reports about a temporary demo instance should specify the exact URL involved.
