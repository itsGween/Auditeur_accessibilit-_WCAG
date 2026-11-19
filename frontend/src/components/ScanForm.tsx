import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { GcdsButton, GcdsFieldset, GcdsInput, GcdsText } from '@gcds-core/components-react';
import { getStoredAccessToken, setStoredAccessToken } from '../api/accessToken';
import { ApiError, isUnauthorized } from '../api/client';
import { createSite } from '../api/sites';
import { createScan } from '../api/scans';

export function ScanForm(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [accessToken, setAccessToken] = useState(() => getStoredAccessToken() ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setUrlError(null);
    setTokenError(null);
    setSubmitting(true);
    setStoredAccessToken(accessToken);
    try {
      const site = await createSite(url.trim(), label.trim() || undefined);
      const scan = await createScan(site.id);
      navigate(`/${lang}/scans/${scan.id}`);
    } catch (err) {
      if (isUnauthorized(err)) {
        setTokenError(t('auth.unauthorized'));
      } else {
        setUrlError(err instanceof ApiError ? err.message : t('scanForm.errorGeneric'));
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} noValidate>
      <GcdsFieldset legend={t('scanForm.legend')} legendSize="h2">
        <GcdsInput
          inputId="scan-url"
          name="url"
          type="url"
          label={t('scanForm.urlLabel')}
          hint={t('scanForm.urlHint')}
          value={url}
          required
          disabled={submitting}
          errorMessage={urlError ?? undefined}
          onGcdsInput={(e) => setUrl(e.detail)}
        />
        <GcdsInput
          inputId="scan-label"
          name="label"
          type="text"
          label={t('scanForm.labelLabel')}
          hint={t('scanForm.labelHint')}
          value={label}
          disabled={submitting}
          onGcdsInput={(e) => setLabel(e.detail)}
        />
        <GcdsInput
          inputId="scan-access-token"
          name="accessToken"
          type="password"
          autocomplete="off"
          label={t('auth.tokenLabel')}
          hint={t('auth.tokenHint')}
          value={accessToken}
          disabled={submitting}
          errorMessage={tokenError ?? undefined}
          onGcdsInput={(e) => setAccessToken(e.detail)}
        />
      </GcdsFieldset>
      <GcdsButton type="submit" disabled={submitting}>
        {t('scanForm.submit')}
      </GcdsButton>
      {submitting && <GcdsText role="status">{t('scanForm.submitting')}</GcdsText>}
    </form>
  );
}
