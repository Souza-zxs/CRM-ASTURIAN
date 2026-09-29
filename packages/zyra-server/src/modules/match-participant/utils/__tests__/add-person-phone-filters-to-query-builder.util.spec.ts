import { addPersonPhoneFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-phone-filters-to-query-builder';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type SelectQueryBuilder } from 'typeorm';

describe('addPersonPhoneFiltersToQueryBuilder', () => {
  const buildQueryBuilderMock = () => {
    const queryBuilder: Partial<SelectQueryBuilder<PersonWorkspaceEntity>> = {};

    queryBuilder.select = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.where = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.andWhere = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.orWhere = jest.fn().mockReturnValue(queryBuilder);
    queryBuilder.withDeleted = jest.fn().mockReturnValue(queryBuilder);

    return queryBuilder as SelectQueryBuilder<PersonWorkspaceEntity>;
  };

  it('filters on the primary phone number column', () => {
    const queryBuilder = buildQueryBuilderMock();

    addPersonPhoneFiltersToQueryBuilder({
      queryBuilder,
      phoneNumbers: ['5511999999999'],
    });

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'person.phonesPrimaryPhoneNumber IN (:...phoneNumbers)',
      { phoneNumbers: ['5511999999999'] },
    );
  });

  it('adds a jsonb containment orWhere per phone number for additionalPhones', () => {
    const queryBuilder = buildQueryBuilderMock();

    addPersonPhoneFiltersToQueryBuilder({
      queryBuilder,
      phoneNumbers: ['5511999999999', '5511888888888'],
    });

    expect(queryBuilder.orWhere).toHaveBeenCalledWith(
      'person.phonesAdditionalPhones @> :phoneNumber0::jsonb',
      { phoneNumber0: JSON.stringify([{ number: '5511999999999' }]) },
    );
    expect(queryBuilder.orWhere).toHaveBeenCalledWith(
      'person.phonesAdditionalPhones @> :phoneNumber1::jsonb',
      { phoneNumber1: JSON.stringify([{ number: '5511888888888' }]) },
    );
  });

  it('excludes given person ids from both the primary and additional filters', () => {
    const queryBuilder = buildQueryBuilderMock();

    addPersonPhoneFiltersToQueryBuilder({
      queryBuilder,
      phoneNumbers: ['5511999999999'],
      excludePersonIds: ['person-1'],
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'person.id NOT IN (:...excludePersonIds)',
      { excludePersonIds: ['person-1'] },
    );
    expect(queryBuilder.orWhere).toHaveBeenCalledWith(
      'person.id NOT IN (:...excludePersonIds) AND person.phonesAdditionalPhones @> :phoneNumber0::jsonb',
      {
        excludePersonIds: ['person-1'],
        phoneNumber0: JSON.stringify([{ number: '5511999999999' }]),
      },
    );
  });
});
