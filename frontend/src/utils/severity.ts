import { Violation } from '../api/types';

export type Severity = 'critical' | 'serious' | 'moderate' | 'minor' | 'unknown';

export const SEVERITY_ORDER: readonly Severity[] = ['critical', 'serious', 'moderate', 'minor', 'unknown'];

function toSeverity(impact: string): Severity {
  return (SEVERITY_ORDER as readonly string[]).includes(impact) ? (impact as Severity) : 'unknown';
}

export function groupBySeverity(violations: readonly Violation[]): Map<Severity, Violation[]> {
  const grouped = new Map<Severity, Violation[]>();
  for (const severity of SEVERITY_ORDER) grouped.set(severity, []);
  for (const violation of violations) {
    grouped.get(toSeverity(violation.impact))?.push(violation);
  }
  return grouped;
}

export function conformityScore(passCount: number | null, violationCount: number | null): number | null {
  const total = (passCount ?? 0) + (violationCount ?? 0);
  if (total === 0) return null;
  return Math.round(((passCount ?? 0) / total) * 100);
}
