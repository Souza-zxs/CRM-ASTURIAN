import { Global, Module } from '@nestjs/common';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';

@Global()
@Module({
  imports: [ZyraConfigModule],
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
