/**
 * The mutation access token is typed by the user and kept in sessionStorage only: it lives for
 * the current tab and is never baked into the bundle (a VITE_* variable would be readable by
 * anyone downloading the JavaScript). Storage can be unavailable (private mode, blocked site
 * data), so every access is wrapped and degrades to "no token".
 */
const STORAGE_KEY = 'wcag-auditor.accessToken';

export function getStoredAccessToken(): string | null {
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    return value && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

/** Stores the token for this tab; an empty value clears it. */
export function setStoredAccessToken(token: string): void {
  try {
    const trimmed = token.trim();
    if (trimmed) {
      window.sessionStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage unavailable: the token simply won't be remembered between page loads
  }
}
