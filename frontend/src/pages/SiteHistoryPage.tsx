import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GcdsHeading, GcdsLink, GcdsText } from '@gcds-core/components-react';
import { RescanButton } from '../components/RescanButton';
import { getSite } from '../api/sites';
import { complianceStatementPdfUrl } from '../api/reports';
import { SiteWithScans } from '../api/types';
import { isSupportedLanguage } from '../i18n/languages';
import { formatDate } from '../utils/format';

export function SiteHistoryPage(): JSX.Element {
  const { t } = useTranslation();
  const { lang, siteId } = useParams<{ lang: string; siteId: string }>();
  const validLang = isSupportedLanguage(lang) ? lang : 'fr';
  const [site, setSite] = useState<SiteWithScans | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!siteId) return;
    getSite(siteId)
      .then(setSite)
      .catch(() => setNotFound(true));
  }, [siteId]);

  if (notFound) {
    return (
      <>
        <GcdsHeading tag="h1">{t('siteHistory.heading')}</GcdsHeading>
        <GcdsText>{t('siteHistory.notFound')}</GcdsText>
      </>
    );
  }

  if (!site) {
    return (
      <>
        <GcdsHeading tag="h1">{t('siteHistory.heading')}</GcdsHeading>
        <GcdsText role="status">{t('siteHistory.loading')}</GcdsText>
      </>
    );
  }

  const completedScans = site.scans.filter((scan) => scan.status === 'COMPLETED');
  const chartData = [...completedScans].reverse().map((scan) => ({
    date: formatDate(scan.startedAt, validLang),
    violations: scan.violationCount ?? 0,
  }));

  return (
    <>
      <GcdsHeading tag="h1">{t('siteHistory.heading')}</GcdsHeading>
      <p>
        <strong>{site.label || site.url}</strong>
        {site.label && <> — {site.url}</>}
      </p>

      <RescanButton siteId={site.id} />

      <div className="export-actions">
        <Link to={`/${validLang}`}>{t('siteHistory.newScan')}</Link>
        {completedScans.length > 0 && (
          <GcdsLink href={complianceStatementPdfUrl(site.id, validLang)}>
            {t('siteHistory.generateDeclaration')}
          </GcdsLink>
        )}
      </div>

      {chartData.length > 1 && (
        <>
          <GcdsHeading tag="h2">{t('siteHistory.trendHeading')}</GcdsHeading>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                allowDecimals={false}
                label={{ value: t('siteHistory.trendYAxis'), angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Line type="monotone" dataKey="violations" stroke="#af3c43" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      <GcdsHeading tag="h2">{t('siteHistory.scansHeading')}</GcdsHeading>
      {site.scans.length === 0 ? (
        <GcdsText>{t('siteHistory.noScans')}</GcdsText>
      ) : (
        <table className="app-table">
          <caption>{t('siteHistory.scansHeading')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('siteHistory.table.date')}</th>
              <th scope="col">{t('siteHistory.table.status')}</th>
              <th scope="col">{t('siteHistory.table.violations')}</th>
              <th scope="col">{t('siteHistory.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {site.scans.map((scan) => (
              <tr key={scan.id}>
                <td>{formatDate(scan.startedAt, validLang)}</td>
                <td>{t(`scanStatus.${scan.status}`)}</td>
                <td>{scan.violationCount ?? '—'}</td>
                <td>
                  <Link to={`/${validLang}/scans/${scan.id}`}>{t('siteHistory.viewDetails')}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
