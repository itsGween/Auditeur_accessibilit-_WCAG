import { useTranslation } from 'react-i18next';
import { GcdsHeading, GcdsText } from '@gcds-core/components-react';
import { ScanForm } from '../components/ScanForm';

export function HomePage(): JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      <GcdsHeading tag="h1">{t('app.title')}</GcdsHeading>
      <GcdsText>{t('app.tagline')}</GcdsText>
      <GcdsText>{t('home.intro')}</GcdsText>
      <ScanForm />
    </>
  );
}
