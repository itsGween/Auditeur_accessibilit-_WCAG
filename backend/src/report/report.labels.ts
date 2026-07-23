export type ReportLanguage = 'fr' | 'en';

export const REPORT_LABELS = {
  fr: {
    csv: {
      ruleId: 'Règle',
      impact: 'Impact',
      wcagCriteria: 'Critères WCAG',
      description: 'Description',
      helpUrl: "Lien d'aide",
      htmlSnippet: 'Extrait HTML',
      targetSelector: 'Sélecteur CSS',
    },
    pdf: {
      title: "Rapport de scan d'accessibilité",
      site: 'Site',
      scanDate: 'Date du scan',
      status: 'Statut',
      summary: 'Résumé',
      conformityScore: 'Score de conformité',
      passCount: 'Vérifications réussies',
      violationCount: 'Violations détectées',
      violationsBySeverity: 'Violations par sévérité',
      noViolations: 'Aucune violation détectée pour ce niveau de sévérité.',
      wcagCriteria: 'Critères WCAG',
      helpUrl: "Plus d'information",
      selector: 'Sélecteur',
      severity: {
        critical: 'Critique',
        serious: 'Sérieux',
        moderate: 'Modéré',
        minor: 'Mineur',
        unknown: 'Non précisé',
      },
    },
    declaration: {
      title: "Déclaration d'accessibilité",
      site: 'Site évalué',
      date: 'Date de la déclaration',
      methodologyHeading: 'Méthodologie',
      methodology:
        "Cette déclaration s'appuie sur un test automatisé exécuté avec Playwright et axe-core, ciblant les critères de succès des Règles pour l'accessibilité des contenus Web (WCAG) 2.1, niveaux A et AA. Le test automatisé a été effectué sur la page suivante uniquement, à la date indiquée ci-dessous.",
      scopeHeading: 'Portée',
      scopeIntro:
        'Cette déclaration porte uniquement sur la page suivante, telle que scannée à la date indiquée :',
      limitationsHeading: 'Limitations connues',
      limitationsIntro:
        "Les tests automatisés ne peuvent détecter qu'une partie des problèmes d'accessibilité possibles (environ 30 à 50 % selon les études du secteur). Un audit manuel complémentaire, incluant une navigation au clavier et un test avec un lecteur d'écran, est recommandé pour une évaluation complète de la conformité.",
      violationsFound: (count: number) =>
        `Le scan automatisé a détecté ${count} violation(s) au moment du test, énumérées ci-dessous.`,
      noViolationsFound:
        "Aucune violation n'a été détectée par le scan automatisé au moment du test. Cela ne garantit pas une conformité complète : voir la section Limitations connues.",
      noScanAvailable:
        "Aucun scan complété n'est disponible pour ce site. Une déclaration ne peut pas être générée.",
    },
  },
  en: {
    csv: {
      ruleId: 'Rule',
      impact: 'Impact',
      wcagCriteria: 'WCAG Criteria',
      description: 'Description',
      helpUrl: 'Help URL',
      htmlSnippet: 'HTML Snippet',
      targetSelector: 'CSS Selector',
    },
    pdf: {
      title: 'Accessibility Scan Report',
      site: 'Site',
      scanDate: 'Scan date',
      status: 'Status',
      summary: 'Summary',
      conformityScore: 'Conformity score',
      passCount: 'Passed checks',
      violationCount: 'Violations found',
      violationsBySeverity: 'Violations by severity',
      noViolations: 'No violations found for this severity level.',
      wcagCriteria: 'WCAG Criteria',
      helpUrl: 'More information',
      selector: 'Selector',
      severity: {
        critical: 'Critical',
        serious: 'Serious',
        moderate: 'Moderate',
        minor: 'Minor',
        unknown: 'Unspecified',
      },
    },
    declaration: {
      title: 'Accessibility Statement',
      site: 'Site evaluated',
      date: 'Statement date',
      methodologyHeading: 'Methodology',
      methodology:
        'This statement is based on automated testing performed with Playwright and axe-core, targeting the Web Content Accessibility Guidelines (WCAG) 2.1 success criteria at levels A and AA. The automated test was performed on the page below only, on the date indicated.',
      scopeHeading: 'Scope',
      scopeIntro:
        'This statement covers only the following page, as scanned on the date indicated:',
      limitationsHeading: 'Known limitations',
      limitationsIntro:
        'Automated testing can only detect a subset of possible accessibility issues (roughly 30-50% according to industry studies). A complementary manual audit, including keyboard navigation and screen reader testing, is recommended for a complete conformance assessment.',
      violationsFound: (count: number) =>
        `The automated scan detected ${count} violation(s) at the time of testing, listed below.`,
      noViolationsFound:
        'The automated scan did not detect any violations at the time of testing. This does not guarantee full conformance: see the Known limitations section.',
      noScanAvailable:
        'No completed scan is available for this site. A statement cannot be generated.',
    },
  },
} as const;
