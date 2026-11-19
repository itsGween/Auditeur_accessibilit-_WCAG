import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { GcdsButton, GcdsText } from '@gcds-core/components-react';
import { ApiError, isUnauthorized } from '../api/client';
import { createScan } from '../api/scans';

interface RescanButtonProps {
  siteId: string;
}

/**
 * Runs a new scan of an already-known site and opens its results, so a site's history (and
 * its trend chart) can be filled from the UI. Uses the access token entered in the scan form,
 * if any (sessionStorage).
 */
export function RescanButton({ siteId }: RescanButtonProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(): Promise<void> {
    if (running) return;
    setError(null);
    setRunning(true);
    try {
      const scan = await createScan(siteId);
      setRunning(false);
      navigate(`/${lang}/scans/${scan.id}`);
    } catch (err) {
      if (isUnauthorized(err)) {
        setError(t('auth.unauthorizedRescan'));
      } else if (err instanceof ApiError) {
        setError(t('rescan.failedWithReason', { reason: err.message }));
      } else {
        setError(t('rescan.failed'));
      }
      setRunning(false);
    }
  }

  return (
    <div className="rescan">
      <GcdsButton
        type="button"
        buttonRole="secondary"
        disabled={running}
        onGcdsClick={() => void handleClick()}
      >
        {t('rescan.button')}
      </GcdsButton>
      <div role="status" aria-live="polite">
        {running && <GcdsText>{t('rescan.running')}</GcdsText>}
      </div>
      <div role="alert">{error && <GcdsText>{error}</GcdsText>}</div>
    </div>
  );
}
