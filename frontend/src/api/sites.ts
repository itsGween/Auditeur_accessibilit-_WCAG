import { apiFetch } from './client';
import { Site, SiteWithScans } from './types';

export function createSite(url: string, label?: string): Promise<Site> {
  return apiFetch<Site>('/sites', {
    method: 'POST',
    body: JSON.stringify({ url, label }),
  });
}

export function listSites(): Promise<SiteWithScans[]> {
  return apiFetch<SiteWithScans[]>('/sites');
}

export function getSite(id: string): Promise<SiteWithScans> {
  return apiFetch<SiteWithScans>(`/sites/${id}`);
}
