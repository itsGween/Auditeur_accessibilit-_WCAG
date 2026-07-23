# 0001 — Choix de PostgreSQL plutôt que Cassandra/MongoDB

## Statut

Acceptée

## Contexte

Le projet doit persister trois entités fortement reliées entre elles : `Site`, `Scan` et `Violation` (voir le schéma Prisma, section 6 de `CLAUDE.md`). Un `Site` possède plusieurs `Scan`, et chaque `Scan` possède plusieurs `Violation`. Les cas d'usage principaux sont :

- Lister les scans d'un site, triés par date.
- Calculer une tendance du nombre de violations dans le temps pour un site donné (graphique d'historique).
- Regrouper les violations d'un scan par sévérité et par critère WCAG (le champ `wcagCriteria` est un tableau de chaînes).
- Générer des rapports (CSV, PDF, déclaration de conformité) à partir de jointures Site → Scan → Violation.

## Décision

Utiliser PostgreSQL comme base de données relationnelle, via Prisma comme ORM.

Les raisons principales :

- **Les données sont intrinsèquement relationnelles et la charge est en lecture jointe.** Chaque requête utile (historique d'un site, détail d'un scan) traverse la relation Site → Scan → Violation. Un modèle relationnel avec clés étrangères et jointures exprime cela nativement; un magasin document (MongoDB) obligerait soit à dupliquer les violations dans chaque document de scan (bon pour la lecture d'un scan isolé, mais pénible pour agréger à travers plusieurs scans), soit à faire des références manuelles sans intégrité référentielle. Un magasin large-column (Cassandra) est pensé pour des écritures massives partitionnées par clé, ce qui ne correspond pas du tout au profil de charge ici (un scan à la fois, pas de fan-out d'écriture).
- **Type natif `String[]`** pour `wcagCriteria` : PostgreSQL supporte les tableaux natifs, ce qui évite une table de jointure supplémentaire pour une liste de critères par violation, sans sacrifier la possibilité de filtrer/rechercher dedans plus tard (`@>`, `ANY`, etc.).
- **Cohérence transactionnelle** : la création d'un scan puis l'insertion en masse de ses violations (`prisma.violation.createMany`) bénéficie des garanties ACID d'une base relationnelle — un scan ne doit jamais se retrouver dans un état où seules certaines violations ont été persistées.
- **Écosystème gouvernemental** : PostgreSQL est largement utilisé et bien supporté dans l'infrastructure du gouvernement du Canada, ce qui réduit la friction si ce projet devait un jour être adapté à un contexte réel de déploiement GC.
- **Support de premier ordre par Prisma**, l'ORM déjà retenu pour sa sécurité de type de bout en bout avec TypeScript.

## Conséquences

- Le schéma doit être migré explicitement (`prisma migrate`) à chaque changement de structure, contrairement à un magasin document sans schéma. C'est un compromis assumé : la rigueur du schéma correspond à des données dont la forme est stable et connue à l'avance.
- La mise à l'échelle horizontale en écriture (sharding) n'est pas triviale avec PostgreSQL comparé à Cassandra. Ce n'est pas un problème pour ce projet : la portée du MVP est un scan à la fois (voir section 5 de `CLAUDE.md`), sans file d'attente asynchrone ni charge concurrente à grande échelle.

---

# 0001 — Choosing PostgreSQL over Cassandra/MongoDB

## Status

Accepted

## Context

The project persists three tightly related entities: `Site`, `Scan`, and `Violation` (see the Prisma schema, `CLAUDE.md` section 6). A `Site` has many `Scan`s, and each `Scan` has many `Violation`s. The main use cases are:

- Listing a site's scans, ordered by date.
- Computing a violation-count trend over time for a given site (history chart).
- Grouping a scan's violations by severity and by WCAG criterion (`wcagCriteria` is a string array).
- Generating reports (CSV, PDF, compliance statement) from Site → Scan → Violation joins.

## Decision

Use PostgreSQL as the relational database, via Prisma as the ORM.

Main reasons:

- **The data is inherently relational and the workload is join-heavy reads.** Every meaningful query (a site's history, a scan's detail) traverses the Site → Scan → Violation relationship. A relational model with foreign keys and joins expresses this natively; a document store (MongoDB) would force either duplicating violations inside every scan document (fine for reading one scan in isolation, awkward for aggregating across many scans) or manual references with no referential integrity. A wide-column store (Cassandra) is built for massive writes partitioned by key, which doesn't match this workload at all (one scan at a time, no write fan-out).
- **Native `String[]` type** for `wcagCriteria`: PostgreSQL supports native arrays, avoiding an extra join table for a per-violation list of criteria, without giving up the ability to filter/search within it later (`@>`, `ANY`, etc.).
- **Transactional consistency**: creating a scan and then bulk-inserting its violations (`prisma.violation.createMany`) benefits from a relational database's ACID guarantees — a scan should never end up with only some of its violations persisted.
- **Government ecosystem fit**: PostgreSQL is widely used and well supported across Government of Canada infrastructure, reducing friction if this project were ever adapted for a real GC deployment context.
- **First-class support from Prisma**, the ORM already chosen for its end-to-end TypeScript type safety.

## Consequences

- The schema must be migrated explicitly (`prisma migrate`) on every structural change, unlike a schemaless document store. This is an accepted tradeoff: schema rigor matches data whose shape is stable and known upfront.
- Horizontal write scaling (sharding) is not as trivial with PostgreSQL as with Cassandra. This isn't a concern for this project: the MVP scope is one scan at a time (see `CLAUDE.md` section 5), with no async queue or large-scale concurrent load.
