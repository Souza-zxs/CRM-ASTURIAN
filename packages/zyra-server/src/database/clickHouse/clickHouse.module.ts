import { Module } from '@nestjs/common';

import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';

import { ClickHouseService } from './clickHouse.service';

@Module({
  imports: [ZyraConfigModule],
  providers: [ClickHouseService],
  exports: [ClickHouseService],
})
export class ClickHouseModule {}
