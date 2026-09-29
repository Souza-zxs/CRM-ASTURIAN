import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export const findPersonByPrimaryOrAdditionalPhoneNumber = ({
  people,
  phoneNumber,
}: {
  people: PersonWorkspaceEntity[];
  phoneNumber: string;
}): PersonWorkspaceEntity | undefined => {
  const personWithPrimaryPhoneNumber = people.find(
    (person) => person.phones?.primaryPhoneNumber === phoneNumber,
  );

  if (personWithPrimaryPhoneNumber) {
    return personWithPrimaryPhoneNumber;
  }

  return people.find((person) => {
    const additionalPhones = person.phones?.additionalPhones;

    if (!Array.isArray(additionalPhones)) {
      return false;
    }

    return additionalPhones.some(
      (additionalPhone) => additionalPhone.number === phoneNumber,
    );
  });
};
