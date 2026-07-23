# 0002 — Choix de Playwright + axe-core plutôt qu'un moteur maison

## Statut

Acceptée

## Contexte

L'application doit charger une URL publique quelconque, exécuter un test d'accessibilité WCAG 2.1 A/AA dessus, et produire une liste de violations catégorisées (règle, impact, critère WCAG, extrait HTML, sélecteur CSS). Deux approches ont été considérées :

1. Écrire un moteur d'analyse maison : parser le HTML récupéré via une requête HTTP simple, puis appliquer des règles d'accessibilité écrites à la main (contraste de couleur, attributs `alt`, structure de titres, etc.).
2. Utiliser un navigateur headless pour charger la page comme un vrai navigateur le ferait, puis exécuter un moteur de règles WCAG existant et éprouvé dans cette page.

## Décision

Utiliser Playwright pour piloter un Chromium headless, et `@axe-core/playwright` (la classe `AxeBuilder`) pour exécuter les règles d'accessibilité dans la page réellement rendue.

Raisons principales :

- **Un simple fetch HTML ne suffit pas.** De nombreux problèmes d'accessibilité n'existent qu'après exécution du JavaScript de la page (contenu injecté dynamiquement, attributs ARIA mis à jour au chargement, focus management, etc.). La grande majorité des sites modernes — y compris les projets du portfolio à auditer (gweenkangah.pro, GENIXI, SmartCart) — sont des applications rendues côté client. Un moteur maison basé sur un parseur HTML statique manquerait systématiquement ces cas.
- **axe-core est le moteur de règles WCAG le plus utilisé et le plus audité de l'industrie** (maintenu par Deque Systems, utilisé par Chrome DevTools, Lighthouse, et par la majorité des outils d'audit d'accessibilité commerciaux). Réimplémenter des dizaines de règles WCAG correctement — avec leurs nombreux cas limites (contraste sur fond dégradé, éléments masqués, ARIA implicite vs explicite) — represente un travail d'ingénierie considérable, sujet à erreur, et qui dupliquerait un travail déjà fait et maintenu par une communauté entière.
- **La crédibilité du projet en dépend.** Un outil qui prétend auditer la conformité WCAG doit s'appuyer sur un moteur de référence reconnu, et non sur une interprétation maison des critères de succès — un jury technique (ou un futur employeur du secteur public) évaluerait défavorablement une réimplémentation partielle et non éprouvée des règles WCAG.
- **`@axe-core/playwright` s'intègre directement dans la page Playwright déjà chargée**, sans étape d'export/import supplémentaire, et fournit exactement les données nécessaires par violation (id de règle, `impact`, `tags` incluant les critères WCAG, `nodes` avec `html` et `target` pour le sélecteur).

## Conséquences

- Chaque scan nécessite de lancer un navigateur Chromium complet, ce qui est plus coûteux en ressources (CPU, mémoire, temps de démarrage) qu'un simple fetch HTTP. C'est un compromis assumé pour l'exactitude du résultat, atténué par le fait que le MVP scanne une URL à la fois (voir section 5 de `CLAUDE.md`, pas de file d'attente à grande échelle pour l'instant).
- Le déploiement en conteneur doit prévoir les dépendances système de Chromium (voir ADR sur l'infrastructure et la section 11.7 du prompt maître) — traité en phase 7 via l'image `mcr.microsoft.com/playwright` ou `npx playwright install --with-deps`.
- axe-core ne détecte automatiquement qu'une partie des problèmes d'accessibilité possibles (30 à 50 % selon les études du secteur) — cette limite est documentée explicitement dans `ACCESSIBILITY_STATEMENT.md` et dans chaque déclaration de conformité générée par l'outil, plutôt que d'être passée sous silence.

---

# 0002 — Choosing Playwright + axe-core over a custom-built engine

## Status

Accepted

## Context

The application needs to load an arbitrary public URL, run a WCAG 2.1 A/AA accessibility test against it, and produce a categorized list of violations (rule, impact, WCAG criterion, HTML snippet, CSS selector). Two approaches were considered:

1. Write a custom analysis engine: parse HTML fetched via a plain HTTP request, then apply hand-written accessibility rules (color contrast, `alt` attributes, heading structure, etc.).
2. Use a headless browser to load the page the way a real browser would, then run an existing, battle-tested WCAG rules engine against that rendered page.

## Decision

Use Playwright to drive headless Chromium, and `@axe-core/playwright` (the `AxeBuilder` class) to run accessibility rules against the actually-rendered page.

Main reasons:

- **A plain HTML fetch isn't enough.** Many accessibility issues only exist after the page's JavaScript has run (dynamically injected content, ARIA attributes updated on load, focus management, etc.). The vast majority of modern sites — including the portfolio projects this tool is meant to audit (gweenkangah.pro, GENIXI, SmartCart) — are client-rendered applications. A custom engine built on a static HTML parser would systematically miss these cases.
- **axe-core is the most widely used and most audited WCAG rules engine in the industry** (maintained by Deque Systems, used by Chrome DevTools, Lighthouse, and most commercial accessibility auditing tools). Correctly reimplementing dozens of WCAG rules — with their many edge cases (contrast against a gradient background, hidden elements, implicit vs. explicit ARIA) — is a substantial, error-prone engineering effort that would duplicate work already done and maintained by an entire community.
- **The project's credibility depends on it.** A tool that claims to audit WCAG conformance needs to rely on a recognized reference engine, not a homegrown interpretation of the success criteria — a technical reviewer (or a future public-sector employer) would rightly view a partial, unproven reimplementation of WCAG rules unfavourably.
- **`@axe-core/playwright` integrates directly into the already-loaded Playwright page**, with no extra export/import step, and returns exactly the data needed per violation (rule id, `impact`, `tags` including WCAG criteria, `nodes` with `html` and `target` for the selector).

## Consequences

- Every scan requires launching a full Chromium browser, which is more resource-intensive (CPU, memory, startup time) than a plain HTTP fetch. This is an accepted tradeoff for result accuracy, mitigated by the MVP scanning one URL at a time (see `CLAUDE.md` section 5 — no large-scale queue for now).
- Container deployment must account for Chromium's system dependencies (see the infrastructure ADR and section 11.7 of the master prompt) — handled in phase 7 via the `mcr.microsoft.com/playwright` base image or `npx playwright install --with-deps`.
- axe-core only automatically detects a subset of possible accessibility issues (roughly 30-50% per industry studies) — this limitation is explicitly documented in `ACCESSIBILITY_STATEMENT.md` and in every compliance statement the tool generates, rather than being glossed over.
