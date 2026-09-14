import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstagramChannelEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-channel.entity';
import { InstagramFollowerSnapshotEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-follower-snapshot.entity';
import { InstagramPublicReportEntity } from 'src/engine/metadata-modules/instagram-channel/entities/instagram-public-report.entity';
import { InstagramPublicReportController } from 'src/modules/instagram-public-report/instagram-public-report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstagramPublicReportEntity,
      InstagramChannelEntity,
      InstagramFollowerSnapshotEntity,
    ]),
  ],
  controllers: [InstagramPublicReportController],
})
export class InstagramPublicReportModule {}
