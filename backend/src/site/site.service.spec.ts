import { Site } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SiteService } from './site.service';

function site(overrides: Partial<Site> = {}): Site {
  return {
    id: 'site-1',
    url: 'https://gweenkangah.pro',
    label: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('SiteService.create', () => {
  let prisma: {
    site: { findFirst: jest.Mock; create: jest.Mock; update: jest.Mock };
  };
  let service: SiteService;

  beforeEach(() => {
    prisma = {
      site: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    };
    service = new SiteService(prisma as unknown as PrismaService);
  });

  it('creates a new site with the normalized URL when none exists', async () => {
    prisma.site.findFirst.mockResolvedValue(null);
    prisma.site.create.mockImplementation(({ data }: { data: Partial<Site> }) =>
      Promise.resolve(site({ ...data })),
    );

    const result = await service.create({
      url: ' HTTPS://GweenKangah.pro/#top ',
      label: 'Portfolio',
    });

    expect(prisma.site.findFirst).toHaveBeenCalledWith({
      where: { url: 'https://gweenkangah.pro' },
      orderBy: { createdAt: 'asc' },
    });
    expect(prisma.site.create).toHaveBeenCalledWith({
      data: { url: 'https://gweenkangah.pro', label: 'Portfolio' },
    });
    expect(result.url).toBe('https://gweenkangah.pro');
  });

  it('reuses the existing site instead of creating a duplicate', async () => {
    const existing = site({ id: 'existing-id', label: 'Portfolio' });
    prisma.site.findFirst.mockResolvedValue(existing);

    const result = await service.create({ url: 'https://gweenkangah.pro/' });

    expect(result).toBe(existing);
    expect(prisma.site.create).not.toHaveBeenCalled();
    expect(prisma.site.update).not.toHaveBeenCalled();
  });

  it('looks up the oldest row first, so pre-existing duplicates are left untouched', async () => {
    prisma.site.findFirst.mockResolvedValue(site());
    await service.create({ url: 'https://gweenkangah.pro' });
    expect(prisma.site.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
    );
  });

  it('fills in a missing label on the existing site', async () => {
    prisma.site.findFirst.mockResolvedValue(site({ id: 'existing-id', label: null }));
    prisma.site.update.mockResolvedValue(site({ id: 'existing-id', label: 'Portfolio' }));

    const result = await service.create({ url: 'https://gweenkangah.pro', label: 'Portfolio' });

    expect(prisma.site.update).toHaveBeenCalledWith({
      where: { id: 'existing-id' },
      data: { label: 'Portfolio' },
    });
    expect(result.label).toBe('Portfolio');
    expect(prisma.site.create).not.toHaveBeenCalled();
  });

  it('never overwrites an existing label', async () => {
    const existing = site({ label: 'Original label' });
    prisma.site.findFirst.mockResolvedValue(existing);

    const result = await service.create({ url: 'https://gweenkangah.pro', label: 'New label' });

    expect(result.label).toBe('Original label');
    expect(prisma.site.update).not.toHaveBeenCalled();
  });
});
