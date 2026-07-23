import { mapAxeTagsToWcagCriteria } from './wcag-criteria.mapper';

describe('mapAxeTagsToWcagCriteria', () => {
  it('maps a single known wcag tag to its criterion', () => {
    expect(mapAxeTagsToWcagCriteria(['wcag143'])).toEqual(['1.4.3']);
  });

  it('maps a real axe rule tag set (color-contrast) to 1.4.3', () => {
    expect(mapAxeTagsToWcagCriteria(['cat.color', 'wcag2aa', 'wcag143'])).toEqual(['1.4.3']);
  });

  it('maps a real axe rule tag set (image-alt) to 1.1.1', () => {
    expect(
      mapAxeTagsToWcagCriteria(['cat.text-alternatives', 'wcag2a', 'wcag111', 'section508']),
    ).toEqual(['1.1.1']);
  });

  it('returns multiple criteria sorted numerically, not lexically', () => {
    expect(mapAxeTagsToWcagCriteria(['wcag412', 'wcag111', 'wcag1411'])).toEqual([
      '1.1.1',
      '1.4.11',
      '4.1.2',
    ]);
  });

  it('drops conformance-level and category tags with no direct SC mapping', () => {
    expect(mapAxeTagsToWcagCriteria(['wcag2a', 'wcag2aa', 'wcag21aa', 'cat.forms'])).toEqual([]);
  });

  it('drops best-practice-only tags entirely', () => {
    expect(mapAxeTagsToWcagCriteria(['best-practice'])).toEqual([]);
  });

  it('returns an empty array for an empty tag list', () => {
    expect(mapAxeTagsToWcagCriteria([])).toEqual([]);
  });

  it('deduplicates when a rule tags the same criterion twice', () => {
    expect(mapAxeTagsToWcagCriteria(['wcag143', 'wcag143'])).toEqual(['1.4.3']);
  });

  it('correctly distinguishes visually similar digit groupings (2.4.11 vs 2.4.1 + 1)', () => {
    expect(mapAxeTagsToWcagCriteria(['wcag241'])).toEqual(['2.4.1']);
  });
});
