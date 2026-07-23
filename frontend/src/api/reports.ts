import { apiUrl } from './client';
import { SupportedLanguage } from '../i18n/languages';

export function scanCsvUrl(scanId: string, lang: SupportedLanguage): string {
  return apiUrl(`/scans/${scanId}/report.csv?lang=${lang}`);
}

export function scanPdfUrl(scanId: string, lang: SupportedLanguage): string {
  return apiUrl(`/scans/${scanId}/report.pdf?lang=${lang}`);
}

export function complianceStatementPdfUrl(siteId: string, lang: SupportedLanguage): string {
  return apiUrl(`/sites/${siteId}/compliance-statement.pdf?lang=${lang}`);
}
