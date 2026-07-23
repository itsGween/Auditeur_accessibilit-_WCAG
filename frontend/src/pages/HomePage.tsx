import { useTranslation } from 'react-i18next';

export function HomePage(): JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t('nav.skipToContent')}
      </a>
      <header>
        <h1>{t('app.title')}</h1>
        <p>{t('app.tagline')}</p>
      </header>
      <main id="main-content">
        {/* Scan submission form (GCDS components) is added in phase 5 */}
      </main>
    </>
  );
}
