import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { GcdsHeading, GcdsText } from '@gcds-core/components-react';
import { listSites } from '../api/sites';
import { SiteWithScans } from '../api/types';
import { isSupportedLanguage } from '../i18n/languages';
import { formatDate } from '../utils/format';

export function DashboardPage(): JSX.Element {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const validLang = isSupportedLanguage(lang) ? lang : 'fr';
  const [sites, setSites] = useState<SiteWithScans[] | null>(null);

  useEffect(() => {
    void listSites().then(setSites);
  }, []);

  return (
    <>
      <GcdsHeading tag="h1">{t('dashboard.heading')}</GcdsHeading>
      <GcdsText>{t('dashboard.intro')}</GcdsText>

      {sites === null && <GcdsText role="status">…</GcdsText>}
      {sites?.length === 0 && <GcdsText>{t('dashboard.empty')}</GcdsText>}

      {sites && sites.length > 0 && (
        <table className="app-table">
          <caption>{t('dashboard.heading')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('dashboard.table.site')}</th>
              <th scope="col">{t('dashboard.table.lastScan')}</th>
              <th scope="col">{t('dashboard.table.status')}</th>
              <th scope="col">{t('dashboard.table.violations')}</th>
              <th scope="col">{t('dashboard.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => {
              const latestScan = site.scans[0];
              return (
                <tr key={site.id}>
                  <td>{site.label || site.url}</td>
                  <td>
                    {latestScan
                      ? formatDate(latestScan.startedAt, validLang)
                      : t('dashboard.noScanYet')}
                  </td>
                  <td>{latestScan ? t(`scanStatus.${latestScan.status}`) : '—'}</td>
                  <td>{latestScan?.violationCount ?? '—'}</td>
                  <td>
                    <Link to={`/${validLang}/sites/${site.id}`}>{t('dashboard.viewHistory')}</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
