import { Injectable } from '@nestjs/common';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { assertPublicHttpUrl } from './url-safety';
import { mapAxeTagsToWcagCriteria } from './wcag-criteria.mapper';

export interface EngineViolation {
  ruleId: string;
  impact: string;
  wcagCriteria: string[];
  description: string;
  helpUrl: string;
  htmlSnippet: string;
  targetSelector: string;
}

export interface EngineResult {
  violations: EngineViolation[];
  passCount: number;
}

const WCAG_21_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

@Injectable()
export class ScanEngineService {
  async run(url: string, timeoutMs: number): Promise<EngineResult> {
    await assertPublicHttpUrl(url);

    const browser = await chromium.launch();
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      page.setDefaultNavigationTimeout(timeoutMs);
      page.setDefaultTimeout(timeoutMs);
      await page.goto(url, { waitUntil: 'load' });

      const results = await new AxeBuilder({ page }).withTags(WCAG_21_AA_TAGS).analyze();

      const violations: EngineViolation[] = [];
      for (const violation of results.violations) {
        const wcagCriteria = mapAxeTagsToWcagCriteria(violation.tags);
        for (const node of violation.nodes) {
          violations.push({
            ruleId: violation.id,
            impact: violation.impact ?? 'unknown',
            wcagCriteria,
            description: violation.help,
            helpUrl: violation.helpUrl,
            htmlSnippet: node.html,
            targetSelector: node.target
              .map((t) => (Array.isArray(t) ? t.join(' >>> ') : t))
              .join(', '),
          });
        }
      }

      return { violations, passCount: results.passes.length };
    } finally {
      await browser.close();
    }
  }
}
