import { apiFetch } from './client';
import { Scan, ScanWithViolations } from './types';

export function createScan(siteId: string): Promise<Scan> {
  return apiFetch<Scan>(`/sites/${siteId}/scans`, { method: 'POST' });
}

export function getScan(id: string): Promise<ScanWithViolations> {
  return apiFetch<ScanWithViolations>(`/scans/${id}`);
}
