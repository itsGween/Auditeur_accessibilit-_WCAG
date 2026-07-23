# Auditeur d'accessibilité WCAG : prompt maître pour Claude Code

## 0. Comment utiliser ce fichier

Ce fichier est le prompt maître du projet. Il est présent à la racine du dépôt et lu automatiquement en début de session. Applique ces instructions à l'ensemble du projet, pas seulement à la première tâche. Travaille phase par phase (section 11) : termine et présente chaque phase avant de passer à la suivante, sauf indication contraire. Fournis toujours des fichiers complets, jamais des diffs partiels.

## 1. Contexte et objectif

Ce projet est une pièce de portfolio technique construite par Gween Kangah (github.com/itsGween, gweenkangah.pro), diplômée en génie des technologies informatiques (Collège La Cité, Ottawa) et candidate active à des postes IT/CS au gouvernement fédéral canadien, région Ottawa-Gatineau.

L'objectif dépasse la simple fonctionnalité : le projet doit démontrer une compréhension réelle des normes numériques du gouvernement du Canada et des pratiques d'ingénierie professionnelles, avec une documentation qui pourrait plausiblement figurer dans un dépôt de l'organisation GitHub canada-ca.

## 2. Ce que l'application fait

Un outil web qui audite l'accessibilité d'une URL selon le WCAG 2.1 niveau AA, conserve l'historique des scans et présente les résultats dans un tableau de bord bilingue.

Il sera d'abord utilisé pour auditer les projets existants du portfolio (gweenkangah.pro, GENIXI, SmartCart), mais doit rester générique et fonctionner sur n'importe quelle URL publique.

## 3. Stack technique imposée

**Frontend**
- React 18 + TypeScript (mode strict) + Vite
- GC Design System : `@gcds-core/components` + `@gcds-core/components-react`. Important : ce paquet a remplacé `@cdssnc/gcds-components` / `@cdssnc/gcds-components-react`, désormais dépréciés et non maintenus. Utiliser uniquement le nouveau nom `@gcds-core/*`.
- react-i18next pour le bilinguisme : une vraie structure de traduction `fr.json` / `en.json`, pas un simple dictionnaire de libellés
- Recharts pour les graphiques de tendance
- React Router

**Backend**
- NestJS + TypeScript (mode strict)
- Prisma comme ORM, PostgreSQL comme base de données
- Playwright comme dépendance de production (pas seulement dev) pour piloter un navigateur headless
- `@axe-core/playwright` (classe `AxeBuilder`) pour exécuter les règles WCAG dans la page chargée
- `@nestjs/swagger` pour générer la spec OpenAPI depuis les décorateurs
- class-validator / class-transformer pour la validation des DTO

**Infra et outillage**
- Docker + docker-compose (postgres, backend, frontend)
- GitHub Actions (lint, test, build sur chaque PR)
- ESLint + Prettier, configuration stricte

## 4. Fonctionnalités MVP (portée obligatoire, par ordre de priorité)

1. Soumettre une URL publique à auditer via un formulaire (composants GCDS : Fieldset, Input, Button)
2. Lancer un scan : Playwright charge la page en mode headless, injecte axe-core via `AxeBuilder`, récupère les violations
3. Catégoriser chaque violation : règle axe-core, niveau d'impact (critical / serious / moderate / minor), critère(s) WCAG 2.1 concerné(s), extrait HTML de l'élément fautif, sélecteur CSS
4. Persister en base : site, scan, violations (schéma section 6)
5. Tableau de bord : liste des scans passés, détail d'un scan avec violations groupées par sévérité, score de conformité résumé
6. Historique par URL : graphique de tendance du nombre de violations dans le temps
7. Export d'un rapport de scan en PDF (réutiliser Playwright : générer une page HTML de rapport puis `page.pdf()` dessus) et en CSV
8. Génération d'une déclaration de conformité exportable pour une URL scannée, qui imite la structure d'une vraie déclaration d'accessibilité gouvernementale (méthodologie de test, portée, limitations connues, date)
9. Interface entièrement bilingue FR/EN : contenu dupliqué, pas seulement les libellés d'interface

## 5. Hors de portée pour le MVP (à documenter comme feuille de route, ne pas construire maintenant)

- Authentification multi-utilisateur complète et RBAC : ce sujet est couvert en profondeur par le prochain projet du portfolio, SecureGate. Pour le MVP, protéger uniquement les routes de mutation avec un jeton simple basé sur une variable d'environnement si l'app est déployée publiquement
- Crawl automatique d'un site entier ou d'un sitemap (scan d'une seule URL à la fois pour le MVP)
- File d'attente asynchrone (BullMQ + Redis) pour les scans concurrents à grande échelle
- Comparaison avant/après entre deux scans
- Notifications par courriel ou webhook

## 6. Schéma de données (point de départ, Prisma)

```prisma
model Site {
  id        String   @id @default(uuid())
  url       String
  label     String?
  createdAt DateTime @default(now())
  scans     Scan[]
}

model Scan {
  id             String      @id @default(uuid())
  siteId         String
  site           Site        @relation(fields: [siteId], references: [id])
  status         ScanStatus  @default(PENDING)
  startedAt      DateTime    @default(now())
  finishedAt     DateTime?
  passCount      Int?
  violationCount Int?
  violations     Violation[]
}

enum ScanStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

model Violation {
  id             String @id @default(uuid())
  scanId         String
  scan           Scan   @relation(fields: [scanId], references: [id])
  ruleId         String
  impact         String
  wcagCriteria   String[]
  description    String
  helpUrl        String
  htmlSnippet    String
  targetSelector String
}
```

Ajuster si besoin, mais garder la séparation Site / Scan / Violation : elle simplifie l'historique et les tendances.

## 7. Exigences non fonctionnelles

- **Accessibilité de l'outil lui-même (dogfooding)** : le tableau de bord doit être conforme WCAG 2.1 AA, navigation clavier complète, contrastes ≥ 4.5:1, structure de titres logique, lien d'évitement, focus visible. Un projet sur l'accessibilité qui ne serait pas lui-même accessible serait contre-productif.
- **Bilinguisme réel**, pas seulement des libellés de boutons traduits
- **Sécurité de base sur l'URL soumise** : n'accepter que http/https, valider contre les plages d'adresses privées/locales pour éviter le SSRF, timeout raisonnable sur le scan
- **TypeScript strict partout**, pas de `any` implicite
- Tests unitaires au minimum sur la logique de catégorisation des violations (mapping règle axe-core vers critère WCAG)

## 8. Structure de dossiers attendue

```
wcag-auditor/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── i18n/
│       └── api/
├── backend/
│   └── src/
│       ├── site/
│       ├── scan/
│       ├── report/
│       └── health/
├── docs/
│   ├── adr/
│   ├── fr/
│   └── en/
├── docker-compose.yml
├── CLAUDE.md
├── README.md
├── README.en.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
└── LICENSE
```

## 9. Documentation exigée (livrable au même titre que le code)

S'inspirer directement des conventions du dépôt GitHub canada-ca/open-source-logiciel-libre plutôt que d'improviser :

- **README.md** en français (langue par défaut) + **README.en.md** en anglais, tous deux complets : description, capture d'écran, installation, architecture, comment lancer les tests
- **ADR** (`docs/adr/0001-...md`) pour au moins : choix de PostgreSQL plutôt que Cassandra/MongoDB, choix de Playwright + axe-core plutôt qu'un moteur maison, choix du GC Design System plutôt qu'une bibliothèque UI générique
- **SECURITY.md** : politique de divulgation responsable
- **CODE_OF_CONDUCT.md** et **CONTRIBUTING.md**
- **ACCESSIBILITY_STATEMENT.md** : déclaration de conformité WCAG 2.1 AA du projet lui-même (méthodologie, portée, limitations connues), bilingue
- Spec **OpenAPI** générée via `@nestjs/swagger`, exportée dans `docs/openapi.yaml`
- Un diagramme d'architecture simple (Mermaid, directement dans le README)
- **LICENSE** : MIT

## 10. Conventions de code

- Commits conventionnels (`feat:`, `fix:`, `docs:`, etc.)
- Une branche par fonctionnalité, jamais de commit direct sur `main`
- ESLint + Prettier appliqués avant chaque commit
- Ne jamais committer de secrets : fournir un `.env.example`, garder `.env` dans `.gitignore`
- Fichiers complets à chaque livraison, jamais de diff partiel à recoller manuellement

## 11. Plan de livraison en phases

Compléter et présenter chaque phase avant de passer à la suivante.

1. **Scaffold** : structure de dossiers, `package.json` frontend et backend, configuration TypeScript stricte, ESLint/Prettier, `docker-compose.yml` squelette
2. **Backend, cœur de données** : schéma Prisma + migration initiale, modules NestJS `site` et `scan` (CRUD minimal), endpoint `health`
3. **Moteur de scan** : intégration Playwright + `@axe-core/playwright`, logique de catégorisation des violations, tests unitaires sur cette logique
4. **Frontend, socle** : scaffold Vite + React + TS, intégration du GC Design System, routage, structure i18n fr/en
5. **Frontend, fonctionnalités** : formulaire de scan, vue résultats, historique et graphique de tendance, export PDF/CSV, déclaration de conformité
6. **Documentation complète** : README bilingue, ADR, SECURITY.md, CODE_OF_CONDUCT.md, CONTRIBUTING.md, ACCESSIBILITY_STATEMENT.md, export OpenAPI
7. **CI/CD** : Dockerfiles (attention aux dépendances système de Playwright en conteneur : utiliser l'image `mcr.microsoft.com/playwright` ou `npx playwright install --with-deps` dans le Dockerfile), GitHub Actions pour lint/test/build

## 12. Environnement de travail

- Windows, VS Code, terminal Command Prompt
- Git avec workflow branche par tâche déjà en place : le respecter
