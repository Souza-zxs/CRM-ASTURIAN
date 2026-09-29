import { findPersonByPrimaryOrAdditionalPhoneNumber } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-phone-number';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('findPersonByPrimaryOrAdditionalPhoneNumber', () => {
  it('matches on the primary phone number', () => {
    const people = [
      {
        id: 'person-1',
        phones: { primaryPhoneNumber: '5511999999999', additionalPhones: null },
      } as unknown as PersonWorkspaceEntity,
    ];

    const result = findPersonByPrimaryOrAdditionalPhoneNumber({
      people,
      phoneNumber: '5511999999999',
    });

    expect(result?.id).toBe('person-1');
  });

  it('matches on an additional phone number', () => {
    const people = [
      {
        id: 'person-2',
        phones: {
          primaryPhoneNumber: '5511000000000',
          additionalPhones: [
            { number: '5511999999999', countryCode: 'BR', callingCode: '+55' },
          ],
        },
      } as unknown as PersonWorkspaceEntity,
    ];

    const result = findPersonByPrimaryOrAdditionalPhoneNumber({
      people,
      phoneNumber: '5511999999999',
    });

    expect(result?.id).toBe('person-2');
  });

  it('returns undefined when no person matches', () => {
    const result = findPersonByPrimaryOrAdditionalPhoneNumber({
      people: [],
      phoneNumber: '5511999999999',
    });

    expect(result).toBeUndefined();
  });
});
