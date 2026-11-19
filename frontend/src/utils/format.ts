import { SupportedLanguage } from '../i18n/languages';

function locale(lang: SupportedLanguage): string {
  return lang === 'fr' ? 'fr-CA' : 'en-CA';
}

export function formatDate(isoDate: string, lang: SupportedLanguage): string {
  return new Intl.DateTimeFormat(locale(lang), {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}

/**
 * Compact label for the trend chart's x-axis. Includes seconds so that two scans run within the
 * same minute (e.g. a rescan during a demo) still get distinguishable labels.
 */
export function formatChartTick(isoDate: string, lang: SupportedLanguage): string {
  return new Intl.DateTimeFormat(locale(lang), {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(isoDate));
}
