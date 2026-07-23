import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    HealthModule,
    // SiteModule, ScanModule, and ReportModule are added in phase 2 and phase 3
  ],
})
export class AppModule {}
