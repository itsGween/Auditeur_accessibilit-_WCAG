import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSiteDto } from './create-site.dto';

/** Mirrors the global ValidationPipe (transform: true): transform first, then validate. */
async function validateBody(body: Record<string, unknown>) {
  const dto = plainToInstance(CreateSiteDto, body);
  const errors = await validate(dto);
  return { dto, errors };
}

describe('CreateSiteDto', () => {
  it('accepts a URL surrounded by spaces and trims it before validation', async () => {
    const { dto, errors } = await validateBody({ url: '  HTTPS://GweenKangah.PRO/#contact  ' });
    expect(errors).toHaveLength(0);
    expect(dto.url).toBe('HTTPS://GweenKangah.PRO/#contact');
  });

  it('trims the label', async () => {
    const { dto, errors } = await validateBody({
      url: 'https://example.com',
      label: '  Portfolio  ',
    });
    expect(errors).toHaveLength(0);
    expect(dto.label).toBe('Portfolio');
  });

  it.each(['ftp://example.com', 'javascript:alert(1)', 'example.com', 'not a url', ''])(
    'still rejects %p',
    async (url) => {
      const { errors } = await validateBody({ url });
      expect(errors.length).toBeGreaterThan(0);
    },
  );
});
