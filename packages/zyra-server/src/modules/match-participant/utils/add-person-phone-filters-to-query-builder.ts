import { type SelectQueryBuilder } from 'typeorm';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export interface AddPersonPhoneFiltersToQueryBuilderOptions {
  queryBuilder: SelectQueryBuilder<PersonWorkspaceEntity>;
  phoneNumbers: string[];
  excludePersonIds?: string[];
}

// Mirrors addPersonEmailFiltersToQueryBuilder, but phones.additionalPhones is
// a jsonb array of {number, countryCode, callingCode} objects rather than
// bare strings, so the containment check matches on the "number" key only.
export function addPersonPhoneFiltersToQueryBuilder({
  queryBuilder,
  phoneNumbers,
  excludePersonIds = [],
}: AddPersonPhoneFiltersToQueryBuilderOptions): SelectQueryBuilder<PersonWorkspaceEntity> {
  queryBuilder = queryBuilder
    .select([
      'person.id',
      'person.phonesPrimaryPhoneNumber',
      'person.phonesAdditionalPhones',
      'person.deletedAt',
    ])
    .where('person.phonesPrimaryPhoneNumber IN (:...phoneNumbers)', {
      phoneNumbers,
    })
    .withDeleted();

  if (excludePersonIds.length > 0) {
    queryBuilder = queryBuilder.andWhere(
      'person.id NOT IN (:...excludePersonIds)',
      { excludePersonIds },
    );
  }

  for (const [index, phoneNumber] of phoneNumbers.entries()) {
    const phoneNumberParamName = `phoneNumber${index}`;
    const orWhereIsInAdditionalPhones =
      excludePersonIds.length > 0
        ? `person.id NOT IN (:...excludePersonIds) AND person.phonesAdditionalPhones @> :${phoneNumberParamName}::jsonb`
        : `person.phonesAdditionalPhones @> :${phoneNumberParamName}::jsonb`;

    queryBuilder = queryBuilder.orWhere(orWhereIsInAdditionalPhones, {
      ...(excludePersonIds.length > 0 && { excludePersonIds }),
      [phoneNumberParamName]: JSON.stringify([{ number: phoneNumber }]),
    });
  }

  queryBuilder = queryBuilder.withDeleted();

  return queryBuilder;
}
