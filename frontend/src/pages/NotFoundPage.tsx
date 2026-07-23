import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { GcdsHeading, GcdsLink, GcdsText } from '@gcds-core/components-react';

export function NotFoundPage(): JSX.Element {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  return (
    <>
      <GcdsHeading tag="h1">{t('notFound.heading')}</GcdsHeading>
      <GcdsText>{t('notFound.description')}</GcdsText>
      <GcdsLink href={`/${lang}`}>{t('notFound.backLink')}</GcdsLink>
    </>
  );
}
