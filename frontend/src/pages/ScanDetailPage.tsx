import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { GcdsHeading, GcdsLink, GcdsText } from '@gcds-core/components-react';
import { RescanButton } from '../components/RescanButton';
import { getScan } from '../api/scans';
import { scanCsvUrl, scanPdfUrl } from '../api/reports';
import { ScanWithViolations } from '../api/types';
import { isSupportedLanguage } from '../i18n/languages';
import { formatDate } from '../utils/format';
import { groupBySeverity, conformityScore } from '../utils/severity';

export function ScanDetailPage(): JSX.Element {
  const { t } = useTranslation();
  const { lang, scanId } = useParams<{ lang: string; scanId: string }>();
  const validLang = isSupportedLanguage(lang) ? lang : 'fr';
  const [scan, setScan] = useState<ScanWithViolations | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    setScan(null);
    setNotFound(false);
    getScan(scanId)
      .then(setScan)
      .catch(() => setNotFound(true));
  }, [scanId]);

  if (notFound) {
    return (
      <>
        <GcdsHeading tag="h1">{t('scanDetail.heading')}</GcdsHeading>
        <GcdsText>{t('scanDetail.notFound')}</GcdsText>
      </>
    );
  }

  if (!scan) {
    return (
      <>
        <GcdsHeading tag="h1">{t('scanDetail.heading')}</GcdsHeading>
        <GcdsText role="status">{t('scanDetail.loading')}</GcdsText>
      </>
    );
  }

  const score = conformityScore(scan.passCount, scan.violationCount);
  const grouped = groupBySeverity(scan.violations);
  const hasAnyViolations = scan.violations.length > 0;

  return (
    <>
      <GcdsHeading tag="h1">{t('scanDetail.heading')}</GcdsHeading>
      <p>
        <strong>{t('scanDetail.status')}:</strong> {t(`scanStatus.${scan.status}`)}
      </p>
      <p>
        <strong>{t('scanDetail.scanDate')}:</strong> {formatDate(scan.startedAt, validLang)}
      </p>

      {scan.status === 'FAILED' && <GcdsText>{t('scanDetail.failed')}</GcdsText>}

      <RescanButton siteId={scan.siteId} />
      <p>
        <Link to={`/${validLang}/sites/${scan.siteId}`}>{t('scanDetail.viewSiteHistory')}</Link>
      </p>

      {scan.status === 'COMPLETED' && (
        <>
          <GcdsHeading tag="h2">{t('scanDetail.summaryHeading')}</GcdsHeading>
          <div className="summary-grid">
            <div className="summary-tile">
              <span className="value">{score === null ? 'N/A' : `${score}%`}</span>
              <span className="label">{t('scanDetail.conformityScore')}</span>
            </div>
            <div className="summary-tile">
              <span className="value">{scan.passCount ?? 0}</span>
              <span className="label">{t('scanDetail.passCount')}</span>
            </div>
            <div className="summary-tile">
              <span className="value">{scan.violationCount ?? 0}</span>
              <span className="label">{t('scanDetail.violationCount')}</span>
            </div>
          </div>

          <div className="export-actions">
            <GcdsLink href={scanCsvUrl(scan.id, validLang)}>{t('scanDetail.exportCsv')}</GcdsLink>
            <GcdsLink href={scanPdfUrl(scan.id, validLang)}>{t('scanDetail.exportPdf')}</GcdsLink>
          </div>

          <GcdsHeading tag="h2">{t('scanDetail.violationsHeading')}</GcdsHeading>
          {!hasAnyViolations && <GcdsText>{t('scanDetail.noViolationsAtAll')}</GcdsText>}
          {Array.from(grouped.entries())
            .filter(([, violations]) => violations.length > 0)
            .map(([severity, violations]) => (
              <section key={severity}>
                <GcdsHeading tag="h3">
                  {t(`severity.${severity}`)}
                  <span className={`badge badge-${severity}`}>{violations.length}</span>
                </GcdsHeading>
                {violations.map((violation) => (
                  <div className="violation-card" key={violation.id}>
                    <p>
                      <code>{violation.ruleId}</code>
                      {violation.wcagCriteria.map((criterion) => (
                        <span className="wcag-tag" key={criterion}>
                          WCAG {criterion}
                        </span>
                      ))}
                    </p>
                    <p>{violation.description}</p>
                    <p className="selector-text">
                      {t('scanDetail.selector')}: {violation.targetSelector}
                    </p>
                    <pre>{violation.htmlSnippet}</pre>
                    <p>
                      <GcdsLink href={violation.helpUrl}>{t('scanDetail.moreInfo')}</GcdsLink>
                    </p>
                  </div>
                ))}
              </section>
            ))}
        </>
      )}

      <p>
        <Link to={`/${validLang}/dashboard`}>{t('scanDetail.backToDashboard')}</Link>
      </p>
    </>
  );
}
