import { SupportedLanguage } from '../i18n/languages';

export function formatDate(isoDate: string, lang: SupportedLanguage): string {
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(isoDate));
}
