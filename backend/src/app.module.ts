import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { SiteModule } from './site/site.module';
import { ScanModule } from './scan/scan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    PrismaModule,
    HealthModule,
    SiteModule,
    ScanModule,
    // ReportModule is added in phase 3 (scan engine) / phase 5 (PDF/CSV export)
  ],
})
export class AppModule {}
