const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Violation htmlSnippet/description/selector values originate from the scanned page's own
 * markup — untrusted third-party content — so they must be escaped before being embedded in
 * the report HTML that Playwright renders to PDF.
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
}
