# 0003 — Choix du GC Design System plutôt qu'une bibliothèque UI générique

## Statut

Acceptée

## Contexte

Le tableau de bord doit lui-même être conforme WCAG 2.1 AA (voir section 7 de `CLAUDE.md` — un outil d'audit d'accessibilité qui ne serait pas lui-même accessible serait contre-productif), et l'ensemble de l'interface doit être bilingue français/anglais avec du contenu dupliqué, pas seulement des libellés traduits. Le projet vise aussi à démontrer une compréhension réelle des normes numériques du gouvernement du Canada, dans le contexte d'une candidature à des postes IT/CS au gouvernement fédéral.

Deux familles d'options ont été considérées : une bibliothèque de composants générique (MUI, Chakra UI, Ant Design, etc.) ou le GC Design System (`@gcds-core/components` + `@gcds-core/components-react`, le successeur du paquet déprécié `@cdssnc/gcds-components`).

## Décision

Utiliser le GC Design System comme bibliothèque de composants d'interface.

Raisons principales :

- **Accessibilité intégrée par construction.** Les composants du GC Design System (`gcds-header`, `gcds-input`, `gcds-fieldset`, etc.) implémentent déjà les patterns d'accessibilité attendus : navigation par lien d'évitement intégrée au `gcds-header` (prop `skipToHref`), gestion automatique de `aria-describedby`/`aria-invalid` sur les champs de formulaire liés à leur message d'erreur, structure de landmarks correcte (`role="banner"`, nav, etc.). Une bibliothèque générique offrirait ces mêmes primitives HTML mais sans garantie qu'elles respectent spécifiquement les standards d'accessibilité du gouvernement du Canada.
- **Cohérence directe avec l'objectif du projet.** Ce projet doit démontrer une compréhension des normes numériques et des pratiques du gouvernement du Canada. Utiliser le système de conception que Canada.ca utilise réellement en production est plus pertinent, dans ce contexte précis, qu'une bibliothèque UI générique qui n'a aucun lien avec cet écosystème.
- **Le sélecteur de langue et la signature gouvernementale sont fournis prêts à l'emploi** (`gcds-lang-toggle`, `gcds-signature`), ce qui correspond exactement au besoin de bilinguisme réel du projet, plutôt que de devoir construire ces éléments depuis zéro avec une bibliothèque générique.
- **Le paquet `@gcds-core/*` (successeur de `@cdssnc/gcds-components`, désormais déprécié) est activement maintenu par le Service numérique canadien (SNC/CDS)**, avec des wrappers React officiels (`@gcds-core/components-react`) offrant une intégration typée.

## Conséquences

- Les composants du GC Design System sont des Web Components (Stencil) exposés via des wrappers React (`@lit/react` sous le capot). Certaines API ne correspondent pas exactement aux conventions React habituelles (ex. : les événements sont exposés en `onGcdsInput` plutôt que `onChange`, et certaines props documentées dans la classe du composant ne sont pas exposées dans le type public du wrapper — voir par exemple `hasError` sur `gcds-input`, qui doit être déduit automatiquement en ne passant que `errorMessage`). Ceci demande une phase d'apprentissage de l'API du système de conception, documentée au fil du code plutôt que supposée.
- Le GC Design System est optimisé pour des pages de contenu institutionnel plutôt que pour des tableaux de bord de données interactifs (graphiques, tableaux triables). Les tableaux (historique des scans, liste des sites) sont donc construits avec des éléments HTML natifs (`<table>`) plutôt qu'avec le composant `gcds-table`, dont l'API de slots par ligne est plus complexe à intégrer avec du contenu React dynamique — un compromis pragmatique qui reste pleinement accessible sans complexité d'intégration ajoutée.
- Étant un système de conception plus jeune et plus spécialisé qu'une bibliothèque générique établie depuis longtemps, sa communauté et sa documentation tierce sont plus restreintes; la documentation de référence est [design-system.canada.ca](https://design-system.canada.ca/).

---

# 0003 — Choosing the GC Design System over a generic UI library

## Status

Accepted

## Context

The dashboard itself must be WCAG 2.1 AA conformant (see `CLAUDE.md` section 7 — an accessibility auditing tool that wasn't itself accessible would be counterproductive), and the whole interface must be bilingual French/English with duplicated content, not just translated labels. The project also aims to demonstrate a genuine understanding of Government of Canada digital standards, in the context of a federal IT/CS job application.

Two categories of options were considered: a generic component library (MUI, Chakra UI, Ant Design, etc.) or the GC Design System (`@gcds-core/components` + `@gcds-core/components-react`, the successor to the deprecated `@cdssnc/gcds-components` package).

## Decision

Use the GC Design System as the UI component library.

Main reasons:

- **Accessibility built in by construction.** GC Design System components (`gcds-header`, `gcds-input`, `gcds-fieldset`, etc.) already implement the expected accessibility patterns: a skip-to-content link built into `gcds-header` (the `skipToHref` prop), automatic `aria-describedby`/`aria-invalid` wiring between form fields and their error messages, correct landmark structure (`role="banner"`, nav, etc.). A generic library would offer the same underlying HTML primitives, but with no guarantee they specifically follow Government of Canada accessibility standards.
- **Direct alignment with the project's purpose.** This project needs to demonstrate an understanding of Government of Canada digital standards and practices. Using the design system Canada.ca actually runs in production is more relevant, in this specific context, than a generic UI library with no connection to that ecosystem.
- **The language switcher and government signature ship ready-made** (`gcds-lang-toggle`, `gcds-signature`), matching exactly the project's real-bilingualism requirement rather than needing to build these elements from scratch with a generic library.
- **The `@gcds-core/*` package (successor to the now-deprecated `@cdssnc/gcds-components`) is actively maintained by the Canadian Digital Service (CDS)**, with official React wrappers (`@gcds-core/components-react`) providing typed integration.

## Consequences

- GC Design System components are Web Components (Stencil) exposed through React wrappers (`@lit/react` under the hood). Some of the API doesn't map exactly onto usual React conventions (e.g., events are exposed as `onGcdsInput` rather than `onChange`, and some props documented on the component class aren't exposed on the wrapper's public type — see `hasError` on `gcds-input`, which must be inferred automatically by only passing `errorMessage`). This required a learning phase for the design system's API, documented in the code as it was discovered rather than assumed upfront.
- The GC Design System is optimized for institutional content pages rather than interactive data dashboards (charts, sortable tables). Tables (scan history, site list) are therefore built with native HTML elements (`<table>`) rather than the `gcds-table` component, whose per-row slot API is more complex to integrate with dynamic React content — a pragmatic tradeoff that remains fully accessible without added integration complexity.
- Being a younger, more specialized design system than a long-established generic library, its community and third-party documentation are smaller; the reference documentation is [design-system.canada.ca](https://design-system.canada.ca/).
