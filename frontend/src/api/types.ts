export type ScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface Site {
  id: string;
  url: string;
  label: string | null;
  createdAt: string;
}

export interface SiteWithScans extends Site {
  scans: Scan[];
}

export interface Scan {
  id: string;
  siteId: string;
  status: ScanStatus;
  startedAt: string;
  finishedAt: string | null;
  passCount: number | null;
  violationCount: number | null;
}

export interface Violation {
  id: string;
  scanId: string;
  ruleId: string;
  impact: string;
  wcagCriteria: string[];
  description: string;
  helpUrl: string;
  htmlSnippet: string;
  targetSelector: string;
}

export interface ScanWithViolations extends Scan {
  violations: Violation[];
}
