import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'zyra-shared/utils';
import { Repository } from 'typeorm';

import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import {
  PaymentProviderConnectionEntity,
  type PaymentProvider,
} from 'src/engine/metadata-modules/payments/entities/payment-provider-connection.entity';

@Injectable()
export class PaymentProviderConnectionLookupService {
  constructor(
    @InjectRepository(PaymentProviderConnectionEntity)
    private readonly connectionRepository: Repository<PaymentProviderConnectionEntity>,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  // Returns null when there is nothing to verify against — a disabled or
  // never-configured platform for this workspace, or one connected without
  // a secret yet. The controller treats null as "not found" (404), never as
  // "trust the webhook anyway".
  async findEnabledSecret({
    workspaceId,
    provider,
  }: {
    workspaceId: string;
    provider: PaymentProvider;
  }): Promise<string | null> {
    const connection = await this.connectionRepository.findOne({
      where: { workspaceId, provider, isEnabled: true },
    });

    if (!isDefined(connection) || !isDefined(connection.encryptedSecret)) {
      return null;
    }

    return this.secretEncryptionService.decryptVersionedOrThrow(
      connection.encryptedSecret,
      { workspaceId },
    );
  }
}
