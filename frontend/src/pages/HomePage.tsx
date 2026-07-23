import { useTranslation } from 'react-i18next';
import { GcdsButton, GcdsHeading, GcdsText } from '@gcds-core/components-react';
import { useParams } from 'react-router-dom';

export function HomePage(): JSX.Element {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  return (
    <>
      <GcdsHeading tag="h1">{t('app.title')}</GcdsHeading>
      <GcdsText>{t('app.tagline')}</GcdsText>
      <GcdsText>{t('home.intro')}</GcdsText>
      <GcdsButton type="link" href={`/${lang}/dashboard`}>
        {t('home.startCta')}
      </GcdsButton>
    </>
  );
}
