import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GcdsContainer, GcdsFooter, GcdsHeader, GcdsNavLink, GcdsTopNav } from '@gcds-core/components-react';
import { DEFAULT_LANGUAGE, isSupportedLanguage, SupportedLanguage } from '../i18n/languages';

function withLang(pathname: string, lang: SupportedLanguage): string {
  const rest = pathname.split('/').slice(2).join('/');
  return rest ? `/${lang}/${rest}` : `/${lang}`;
}

export function Layout(): JSX.Element {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const validLang = isSupportedLanguage(lang) ? lang : undefined;

  useEffect(() => {
    if (!validLang) return;
    if (i18n.language !== validLang) {
      void i18n.changeLanguage(validLang);
    }
    document.documentElement.lang = validLang;
  }, [validLang, i18n]);

  if (!validLang) {
    return <Navigate to={`/${DEFAULT_LANGUAGE}`} replace />;
  }

  const oppositeLang: SupportedLanguage = validLang === 'fr' ? 'en' : 'fr';

  return (
    <>
      {/*
        GCDS's header/nav/lang-toggle components render real <a> elements: clicking them
        triggers a full browser navigation rather than a client-side route change. That's
        an acceptable tradeoff for this MVP, and matches how GC sites conventionally serve
        each official language at a distinct URL. Client-side navigation is still used for
        in-app flows triggered from code (e.g. after submitting a scan, phase 5).
      */}
      <GcdsHeader
        lang={validLang}
        skipToHref="#main-content"
        langHref={withLang(location.pathname, oppositeLang)}
      >
        <GcdsTopNav slot="menu" label={t('nav.mainNavigation')} lang={validLang}>
          <GcdsNavLink href={`/${validLang}`} current={location.pathname === `/${validLang}`}>
            {t('nav.home')}
          </GcdsNavLink>
          <GcdsNavLink
            href={`/${validLang}/dashboard`}
            current={location.pathname.startsWith(`/${validLang}/dashboard`)}
          >
            {t('nav.dashboard')}
          </GcdsNavLink>
        </GcdsTopNav>
      </GcdsHeader>
      {/*
        The skip link's target (#main-content, tabIndex -1 so it can receive focus) must be a
        plain element, not the GcdsContainer web component: a negative tabindex on a shadow
        host removes everything inside it from sequential Tab navigation, which made the whole
        page content (scan form included) unreachable by keyboard.
      */}
      <main id="main-content" tabIndex={-1}>
        <GcdsContainer tag="div" size="xl" padding="400">
          <Outlet key={validLang} />
        </GcdsContainer>
      </main>
      <GcdsFooter display="compact" lang={validLang} />
    </>
  );
}
