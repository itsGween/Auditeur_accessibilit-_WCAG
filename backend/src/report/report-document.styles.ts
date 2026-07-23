export const REPORT_DOCUMENT_STYLES = `
  body { font-family: Arial, Helvetica, sans-serif; color: #26374a; font-size: 12px; line-height: 1.5; }
  h1 { font-size: 22px; border-bottom: 3px solid #af3c43; padding-bottom: 8px; }
  h2 { font-size: 16px; margin-top: 24px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  h3 { font-size: 13px; margin-top: 16px; margin-bottom: 4px; }
  .meta { margin: 4px 0; }
  .meta strong { display: inline-block; min-width: 160px; }
  .summary-grid { display: flex; gap: 24px; margin-top: 8px; }
  .summary-tile { border: 1px solid #ccc; border-radius: 4px; padding: 10px 16px; }
  .summary-tile .value { font-size: 20px; font-weight: bold; }
  .summary-tile .label { font-size: 11px; color: #555; }
  .violation { border: 1px solid #ddd; border-radius: 4px; padding: 10px 12px; margin-bottom: 10px; page-break-inside: avoid; }
  .violation .rule-id { font-weight: bold; font-family: 'Courier New', monospace; }
  .badge { display: inline-block; border-radius: 3px; padding: 1px 6px; font-size: 10px; font-weight: bold; margin-left: 6px; }
  .badge-critical { background: #f3e9e9; color: #af3c43; border: 1px solid #af3c43; }
  .badge-serious { background: #fbe8d5; color: #8c3d00; border: 1px solid #8c3d00; }
  .badge-moderate { background: #fdf3d0; color: #6f5500; border: 1px solid #6f5500; }
  .badge-minor { background: #e3f0e8; color: #276a3e; border: 1px solid #276a3e; }
  .badge-unknown { background: #eee; color: #555; border: 1px solid #999; }
  .wcag-tag { display: inline-block; background: #26374a; color: #fff; border-radius: 3px; padding: 1px 6px; font-size: 10px; margin-right: 4px; }
  pre { background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; padding: 8px; overflow-wrap: break-word; white-space: pre-wrap; font-size: 10px; }
  .selector { font-family: 'Courier New', monospace; font-size: 11px; }
  a { color: #284162; }
`;
