import { useTranslation } from 'react-i18next';
import { GcdsHeading, GcdsText } from '@gcds-core/components-react';

export function DashboardPage(): JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      <GcdsHeading tag="h1">{t('dashboard.heading')}</GcdsHeading>
      <GcdsText>{t('dashboard.placeholder')}</GcdsText>
    </>
  );
}
