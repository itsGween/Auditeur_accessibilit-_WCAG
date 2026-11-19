import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MutationTokenGuard } from './common/mutation-token.guard';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { SiteModule } from './site/site.module';
import { ScanModule } from './scan/scan.module';
import { ReportModule } from './report/report.module';

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
    ReportModule,
  ],
  providers: [
    // Global: every POST/PUT/PATCH/DELETE route requires the token, including future ones.
    { provide: APP_GUARD, useClass: MutationTokenGuard },
  ],
})
export class AppModule {}
