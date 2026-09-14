import { Module } from '@nestjs/common';

import { ZyraORMModule } from 'src/engine/zyra-orm/zyra-orm.module';

import { RecordPositionService } from './services/record-position.service';

@Module({
  imports: [ZyraORMModule],
  providers: [RecordPositionService],
  exports: [RecordPositionService],
})
export class RecordPositionModule {}
