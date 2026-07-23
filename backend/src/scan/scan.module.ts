import { Module } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { ScanEngineService } from './scan-engine.service';

@Module({
  controllers: [ScanController],
  providers: [ScanService, ScanEngineService],
  exports: [ScanService],
})
export class ScanModule {}
