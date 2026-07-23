/**
 * axe-core tags each rule with a fixed, documented set of "wcagNNN" strings (e.g. "wcag143"
 * for Success Criterion 1.4.3). The digit grouping isn't derivable programmatically — "2411"
 * could be 2.4.11 or, ambiguously, something else — so axe-core itself relies on an explicit
 * table per rule rather than parsing the digits. We do the same here, scoped to the WCAG 2.1
 * Level A and AA criteria this auditor targets (see CLAUDE.md section 4).
 */
export const AXE_TAG_TO_WCAG_CRITERION: Readonly<Record<string, string>> = {
  wcag111: '1.1.1',
  wcag121: '1.2.1',
  wcag122: '1.2.2',
  wcag123: '1.2.3',
  wcag124: '1.2.4',
  wcag125: '1.2.5',
  wcag131: '1.3.1',
  wcag132: '1.3.2',
  wcag133: '1.3.3',
  wcag134: '1.3.4',
  wcag135: '1.3.5',
  wcag141: '1.4.1',
  wcag142: '1.4.2',
  wcag143: '1.4.3',
  wcag144: '1.4.4',
  wcag145: '1.4.5',
  wcag1410: '1.4.10',
  wcag1411: '1.4.11',
  wcag1412: '1.4.12',
  wcag1413: '1.4.13',
  wcag211: '2.1.1',
  wcag212: '2.1.2',
  wcag214: '2.1.4',
  wcag221: '2.2.1',
  wcag222: '2.2.2',
  wcag231: '2.3.1',
  wcag241: '2.4.1',
  wcag242: '2.4.2',
  wcag243: '2.4.3',
  wcag244: '2.4.4',
  wcag245: '2.4.5',
  wcag246: '2.4.6',
  wcag247: '2.4.7',
  wcag251: '2.5.1',
  wcag252: '2.5.2',
  wcag253: '2.5.3',
  wcag254: '2.5.4',
  wcag311: '3.1.1',
  wcag312: '3.1.2',
  wcag321: '3.2.1',
  wcag322: '3.2.2',
  wcag323: '3.2.3',
  wcag324: '3.2.4',
  wcag331: '3.3.1',
  wcag332: '3.3.2',
  wcag333: '3.3.3',
  wcag334: '3.3.4',
  wcag411: '4.1.1',
  wcag412: '4.1.2',
  wcag413: '4.1.3',
};

/**
 * Maps an axe-core rule's `tags` array to the WCAG 2.1 success criteria it corresponds to.
 * Tags with no known WCAG mapping (e.g. "best-practice", "cat.color", "wcag2aa") are dropped
 * rather than guessed at — a rule with no recognized wcag tag legitimately has no SC mapping.
 */
export function mapAxeTagsToWcagCriteria(tags: readonly string[]): string[] {
  const criteria = new Set<string>();
  for (const tag of tags) {
    const criterion = AXE_TAG_TO_WCAG_CRITERION[tag];
    if (criterion) {
      criteria.add(criterion);
    }
  }
  return Array.from(criteria).sort(compareCriteria);
}

function compareCriteria(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}
