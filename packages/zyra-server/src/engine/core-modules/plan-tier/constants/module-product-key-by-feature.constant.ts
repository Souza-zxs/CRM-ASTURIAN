import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { PlanGatedFeature } from 'src/engine/core-modules/plan-tier/enums/plan-gated-feature.enum';

// MANYCHAT_LIKE and INTEGRATIONS are deliberately absent — they have no
// Stripe product key yet because the features themselves don't exist (see
// MODULE_CATALOG's `implemented: false`). Looking one up throws instead of
// silently resolving to undefined, which would make a real bug (typo'd
// feature, forgotten mapping) look identical to "module not purchased".
const MAPPING: Partial<Record<PlanGatedFeature, BillingProductKey>> = {
  [PlanGatedFeature.WHATSAPP]: BillingProductKey.MODULE_WHATSAPP,
  [PlanGatedFeature.INSTAGRAM]: BillingProductKey.MODULE_INSTAGRAM,
  [PlanGatedFeature.AI_AGENT]: BillingProductKey.MODULE_AI_AGENT,
  [PlanGatedFeature.VOICE_AGENT]: BillingProductKey.MODULE_VOICE_AGENT,
  [PlanGatedFeature.WORKFLOWS_ADVANCED]:
    BillingProductKey.MODULE_WORKFLOWS_ADVANCED,
  [PlanGatedFeature.CUSTOM_OBJECTS]: BillingProductKey.MODULE_CUSTOM_OBJECTS,
  [PlanGatedFeature.CUSTOM_FIELDS]: BillingProductKey.MODULE_CUSTOM_FIELDS,
  [PlanGatedFeature.ROW_LEVEL_PERMISSIONS]:
    BillingProductKey.MODULE_ROW_LEVEL_PERMISSIONS,
  [PlanGatedFeature.API_ACCESS]: BillingProductKey.MODULE_API_ACCESS,
  [PlanGatedFeature.MCP]: BillingProductKey.MODULE_MCP,
};

export const MODULE_PRODUCT_KEY_BY_FEATURE = new Proxy(MAPPING, {
  get(target, property: string) {
    if (!(property in target)) {
      throw new Error(
        `No BillingProductKey mapped for PlanGatedFeature "${property}" — ` +
          'either this module has no Stripe product yet (MANYCHAT_LIKE/INTEGRATIONS ' +
          'are not implemented, see module-catalog.constant.ts) or the mapping is missing.',
      );
    }

    return target[property as PlanGatedFeature];
  },
}) as Record<PlanGatedFeature, BillingProductKey>;
