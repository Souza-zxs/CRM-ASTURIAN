export type FunnelLeadName = {
  firstName: string;
  lastName: string;
};

// The funnel form has a single "name" field, but Person stores first/last name
// separately: the first word is the first name, everything else the last name.
export const parseFunnelLeadName = (fullName: string): FunnelLeadName => {
  const [firstName = '', ...remainingNames] = fullName.trim().split(/\s+/);

  return { firstName, lastName: remainingNames.join(' ') };
};
