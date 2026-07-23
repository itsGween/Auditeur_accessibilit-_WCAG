# Guide de contribution

## Mise en route

1. Clonez le dépôt et copiez `.env.example` vers `.env`.
2. Démarrez PostgreSQL : `docker compose up -d postgres`.
3. Backend :
   ```
   cd backend
   npm install
   npx playwright install --with-deps chromium
   npm run prisma:migrate
   npm run start:dev
   ```
4. Frontend :
   ```
   cd frontend
   npm install
   npm run dev
   ```
5. L'API tourne sur `http://localhost:3000` (documentation OpenAPI interactive sur `/api/docs`), le frontend sur `http://localhost:5173`.

## Workflow Git

- **Jamais de commit direct sur `main`.** Chaque changement se fait sur une branche dédiée (`feat/...`, `fix/...`, `docs/...`, `chore/...`), fusionnée ensuite dans `main`.
- Les messages de commit suivent la convention [Conventional Commits](https://www.conventionalcommits.org/) : `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, etc.
- Ouvrez une pull request pour toute modification, même mineure, afin de garder un historique clair des décisions.

## Avant de proposer une modification

Sur le backend (`cd backend`) :

```
npm run lint
npx tsc -p tsconfig.build.json --noEmit
npm test
```

Sur le frontend (`cd frontend`) :

```
npm run lint
npx tsc -b
```

Aucune de ces commandes ne doit produire d'erreur avant l'ouverture d'une pull request.

## Conventions de code

- TypeScript strict partout — évitez `any` implicite ou explicite.
- ESLint + Prettier font foi; utilisez `npm run lint:fix` pour corriger automatiquement le formatage.
- Toute nouvelle logique de catégorisation (mapping règle axe-core → critère WCAG, par exemple) doit être accompagnée de tests unitaires (voir `backend/src/scan/wcag-criteria.mapper.spec.ts` comme référence).
- Le contenu de l'interface est bilingue par duplication réelle des clés `fr`/`en` dans `frontend/src/i18n/locales/`, jamais par traduction automatique au moment de l'affichage.

## Accessibilité

Ce projet audite l'accessibilité d'autres sites — il doit donc être irréprochable sur ce plan lui-même (voir `ACCESSIBILITY_STATEMENT.md`). Toute contribution touchant au frontend doit être vérifiée au clavier (sans souris) et, idéalement, avec un lecteur d'écran avant d'être soumise.

## Signaler un bug ou proposer une fonctionnalité

Ouvrez une issue GitHub en décrivant clairement le comportement observé, le comportement attendu, et les étapes de reproduction s'il s'agit d'un bug.

---

# Contributing Guide

## Getting started

1. Clone the repository and copy `.env.example` to `.env`.
2. Start PostgreSQL: `docker compose up -d postgres`.
3. Backend:
   ```
   cd backend
   npm install
   npx playwright install --with-deps chromium
   npm run prisma:migrate
   npm run start:dev
   ```
4. Frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```
5. The API runs at `http://localhost:3000` (interactive OpenAPI docs at `/api/docs`), the frontend at `http://localhost:5173`.

## Git workflow

- **Never commit directly to `main`.** Every change happens on a dedicated branch (`feat/...`, `fix/...`, `docs/...`, `chore/...`), later merged into `main`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, etc.
- Open a pull request for every change, even minor ones, to keep a clear history of decisions.

## Before proposing a change

Backend (`cd backend`):

```
npm run lint
npx tsc -p tsconfig.build.json --noEmit
npm test
```

Frontend (`cd frontend`):

```
npm run lint
npx tsc -b
```

None of these commands should produce an error before opening a pull request.

## Code conventions

- TypeScript strict everywhere — avoid implicit or explicit `any`.
- ESLint + Prettier are authoritative; use `npm run lint:fix` to auto-fix formatting.
- Any new categorization logic (e.g. axe-core rule → WCAG criterion mapping) must come with unit tests (see `backend/src/scan/wcag-criteria.mapper.spec.ts` as a reference).
- UI content is bilingual through genuine duplication of the `fr`/`en` keys in `frontend/src/i18n/locales/`, never through on-the-fly automatic translation.

## Accessibility

This project audits the accessibility of other sites — it must therefore hold itself to the same standard (see `ACCESSIBILITY_STATEMENT.md`). Any frontend contribution should be verified with keyboard-only navigation and, ideally, with a screen reader before being submitted.

## Reporting a bug or requesting a feature

Open a GitHub issue clearly describing the observed behavior, the expected behavior, and reproduction steps if it's a bug.
