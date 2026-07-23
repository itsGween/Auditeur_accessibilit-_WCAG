import { Injectable, NotFoundException } from '@nestjs/common';
import { Scan, Site, Violation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toCsv } from './csv.util';
import { escapeHtml } from './html-escape.util';
import { renderHtmlToPdf } from './pdf-renderer';
import { REPORT_DOCUMENT_STYLES } from './report-document.styles';
import { REPORT_LABELS, ReportLanguage } from './report.labels';

type ScanWithSiteAndViolations = Scan & { site: Site; violations: Violation[] };
type Severity = 'critical' | 'serious' | 'moderate' | 'minor' | 'unknown';

const SEVERITY_ORDER: readonly Severity[] = ['critical', 'serious', 'moderate', 'minor', 'unknown'];

function toSeverity(impact: string): Severity {
  return (SEVERITY_ORDER as readonly string[]).includes(impact) ? (impact as Severity) : 'unknown';
}

function formatDate(date: Date, lang: ReportLanguage): string {
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  private async getScanOrThrow(scanId: string): Promise<ScanWithSiteAndViolations> {
    const scan = await this.prisma.scan.findUnique({
      where: { id: scanId },
      include: { site: true, violations: true },
    });
    if (!scan) {
      throw new NotFoundException(`Scan ${scanId} introuvable`);
    }
    return scan;
  }

  async getScanCsv(scanId: string, lang: ReportLanguage): Promise<string> {
    const scan = await this.getScanOrThrow(scanId);
    const labels = REPORT_LABELS[lang].csv;
    const rows: string[][] = [
      [
        labels.ruleId,
        labels.impact,
        labels.wcagCriteria,
        labels.description,
        labels.helpUrl,
        labels.htmlSnippet,
        labels.targetSelector,
      ],
      ...scan.violations.map((v) => [
        v.ruleId,
        v.impact,
        v.wcagCriteria.join('; '),
        v.description,
        v.helpUrl,
        v.htmlSnippet,
        v.targetSelector,
      ]),
    ];
    return toCsv(rows);
  }

  async getScanPdf(scanId: string, lang: ReportLanguage): Promise<Buffer> {
    const scan = await this.getScanOrThrow(scanId);
    return renderHtmlToPdf(this.buildScanReportHtml(scan, lang));
  }

  async getComplianceStatementPdf(siteId: string, lang: ReportLanguage): Promise<Buffer> {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      throw new NotFoundException(`Site ${siteId} introuvable`);
    }
    const latestScan = await this.prisma.scan.findFirst({
      where: { siteId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' },
      include: { violations: true },
    });
    return renderHtmlToPdf(this.buildComplianceStatementHtml(site, latestScan, lang));
  }

  private buildScanReportHtml(scan: ScanWithSiteAndViolations, lang: ReportLanguage): string {
    const t = REPORT_LABELS[lang].pdf;
    const total = (scan.passCount ?? 0) + (scan.violationCount ?? 0);
    const score = total > 0 ? Math.round(((scan.passCount ?? 0) / total) * 100) : null;

    const grouped = new Map<Severity, Violation[]>();
    for (const severity of SEVERITY_ORDER) grouped.set(severity, []);
    for (const violation of scan.violations) {
      grouped.get(toSeverity(violation.impact))?.push(violation);
    }

    const sections = SEVERITY_ORDER.filter((s) => (grouped.get(s)?.length ?? 0) > 0)
      .map((severity) => {
        const violations = grouped.get(severity) ?? [];
        const items = violations
          .map(
            (v) => `
        <div class="violation">
          <div><span class="rule-id">${escapeHtml(v.ruleId)}</span>
            ${v.wcagCriteria.map((c) => `<span class="wcag-tag">WCAG ${escapeHtml(c)}</span>`).join('')}
          </div>
          <p>${escapeHtml(v.description)}</p>
          <p class="selector">${t.selector}: ${escapeHtml(v.targetSelector)}</p>
          <pre>${escapeHtml(v.htmlSnippet)}</pre>
          <p><a href="${escapeHtml(v.helpUrl)}">${t.helpUrl}</a></p>
        </div>`,
          )
          .join('');
        return `
      <h3><span class="badge badge-${severity}">${t.severity[severity]}</span> (${violations.length})</h3>
      ${items}`;
      })
      .join('');

    return `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><title>${t.title}</title><style>${REPORT_DOCUMENT_STYLES}</style></head>
<body>
  <h1>${t.title}</h1>
  <p class="meta"><strong>${t.site}:</strong> ${escapeHtml(scan.site.url)}${scan.site.label ? ` (${escapeHtml(scan.site.label)})` : ''}</p>
  <p class="meta"><strong>${t.scanDate}:</strong> ${formatDate(scan.startedAt, lang)}</p>
  <p class="meta"><strong>${t.status}:</strong> ${escapeHtml(scan.status)}</p>

  <h2>${t.summary}</h2>
  <div class="summary-grid">
    <div class="summary-tile"><div class="value">${score === null ? 'N/A' : `${score}%`}</div><div class="label">${t.conformityScore}</div></div>
    <div class="summary-tile"><div class="value">${scan.passCount ?? 0}</div><div class="label">${t.passCount}</div></div>
    <div class="summary-tile"><div class="value">${scan.violationCount ?? 0}</div><div class="label">${t.violationCount}</div></div>
  </div>

  <h2>${t.violationsBySeverity}</h2>
  ${sections || `<p>${t.noViolations}</p>`}
</body>
</html>`;
  }

  private buildComplianceStatementHtml(
    site: Site,
    scan: (Scan & { violations: Violation[] }) | null,
    lang: ReportLanguage,
  ): string {
    const t = REPORT_LABELS[lang].declaration;

    if (!scan) {
      return `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><title>${t.title}</title><style>${REPORT_DOCUMENT_STYLES}</style></head>
<body>
  <h1>${t.title}</h1>
  <p class="meta"><strong>${t.site}:</strong> ${escapeHtml(site.url)}</p>
  <p>${t.noScanAvailable}</p>
</body>
</html>`;
    }

    const violationsList =
      scan.violations.length > 0
        ? `<ul>${scan.violations
            .map(
              (v) =>
                `<li><span class="rule-id">${escapeHtml(v.ruleId)}</span> — ${escapeHtml(v.description)}${
                  v.wcagCriteria.length
                    ? ` (${v.wcagCriteria.map((c) => `WCAG ${escapeHtml(c)}`).join(', ')})`
                    : ''
                }</li>`,
            )
            .join('')}</ul>`
        : '';

    return `<!doctype html>
<html lang="${lang}">
<head><meta charset="utf-8"><title>${t.title}</title><style>${REPORT_DOCUMENT_STYLES}</style></head>
<body>
  <h1>${t.title}</h1>
  <p class="meta"><strong>${t.site}:</strong> ${escapeHtml(site.url)}${site.label ? ` (${escapeHtml(site.label)})` : ''}</p>
  <p class="meta"><strong>${t.date}:</strong> ${formatDate(scan.startedAt, lang)}</p>

  <h2>${t.methodologyHeading}</h2>
  <p>${t.methodology}</p>

  <h2>${t.scopeHeading}</h2>
  <p>${t.scopeIntro}</p>
  <p>${escapeHtml(site.url)}</p>

  <h2>${t.limitationsHeading}</h2>
  <p>${t.limitationsIntro}</p>
  <p>${scan.violations.length > 0 ? t.violationsFound(scan.violations.length) : t.noViolationsFound}</p>
  ${violationsList}
</body>
</html>`;
  }
}
