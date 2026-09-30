import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'zyra-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/zyra-orm/global-workspace-datasource/global-workspace-orm.manager';
import { addPersonPhoneFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-phone-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalPhoneNumber } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-phone-number';
import { normalizePhoneHandleForMatching } from 'src/modules/match-participant/utils/normalize-phone-handle-for-matching';
import { isForwardOpportunityStageMove } from 'src/modules/whatsapp-agent/utils/is-forward-opportunity-stage-move.util';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export type AdvanceOpportunityStageFromQualificationParams = {
  workspaceId: string;
  contactPhoneNumber: string;
  stage: string;
};

// The WhatsApp AI agent's own guess at where this lead is in the pipeline —
// applied to the contact's most recent Opportunity, but only as a forward
// move (see isForwardOpportunityStageMove) so the model can never regress an
// Opportunity a human already advanced further.
@Injectable()
export class WhatsappAgentQualificationOpportunityUpdaterService {
  private readonly logger = new Logger(
    WhatsappAgentQualificationOpportunityUpdaterService.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async advanceOpportunityStageFromQualification({
    workspaceId,
    contactPhoneNumber,
    stage,
  }: AdvanceOpportunityStageFromQualificationParams): Promise<void> {
    try {
      const normalizedPhoneNumber = normalizePhoneHandleForMatching(
        contactPhoneNumber,
      );

      const personRepository =
        await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
          workspaceId,
          'person',
        );

      const matchingPeople = await addPersonPhoneFiltersToQueryBuilder({
        queryBuilder: personRepository.createQueryBuilder('person'),
        phoneNumbers: [normalizedPhoneNumber],
      }).getMany();

      const person = findPersonByPrimaryOrAdditionalPhoneNumber({
        people: matchingPeople,
        phoneNumber: normalizedPhoneNumber,
      });

      if (!isDefined(person)) {
        return;
      }

      const opportunityRepository =
        await this.globalWorkspaceOrmManager.getRepository<OpportunityWorkspaceEntity>(
          workspaceId,
          'opportunity',
        );

      const opportunity = await opportunityRepository.findOne({
        where: { pointOfContactId: person.id },
        order: { createdAt: 'DESC' },
      });

      if (
        !isDefined(opportunity) ||
        !isForwardOpportunityStageMove(opportunity.stage, stage)
      ) {
        return;
      }

      await opportunityRepository.update(opportunity.id, { stage });
    } catch (error) {
      this.logger.error(
        `Failed to advance opportunity stage from WhatsApp agent qualification in workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
