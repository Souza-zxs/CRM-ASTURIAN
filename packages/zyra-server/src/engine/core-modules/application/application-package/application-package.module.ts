import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationVersionValidationService } from 'src/engine/core-modules/application/application-package/application-version-validation.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { ZyraConfigModule } from 'src/engine/core-modules/zyra-config/zyra-config.module';
import { UpgradeModule } from 'src/engine/core-modules/upgrade/upgrade.module';

@Module({
  imports: [
    FileStorageModule,
    SecureHttpClientModule,
    ZyraConfigModule,
    UpgradeModule,
    TypeOrmModule.forFeature([FileEntity, ApplicationEntity]),
  ],
  providers: [
    ApplicationPackageFetcherService,
    ApplicationVersionValidationService,
  ],
  exports: [
    ApplicationPackageFetcherService,
    ApplicationVersionValidationService,
  ],
})
export class ApplicationPackageModule {}
