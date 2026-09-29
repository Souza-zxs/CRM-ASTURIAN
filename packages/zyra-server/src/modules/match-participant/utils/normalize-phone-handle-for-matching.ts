import { parseFunnelLeadPhone } from 'src/engine/metadata-modules/funnel-page/utils/parse-funnel-lead-phone.util';

// Person.phones.primaryPhoneNumber is stored with the Brazilian country-code
// prefix stripped (see parseFunnelLeadPhone / formatPeopleToCreateFromContacts),
// but WhatsApp participant/contact handles arrive with it still attached
// (e.g. "5511999999999"). Matching must apply the same normalization on the
// lookup side, or a Person created from one message can never be found again
// from a later message with the same raw handle.
export const normalizePhoneHandleForMatching = (handle: string): string => {
  return parseFunnelLeadPhone(handle)?.primaryPhoneNumber ?? handle;
};
