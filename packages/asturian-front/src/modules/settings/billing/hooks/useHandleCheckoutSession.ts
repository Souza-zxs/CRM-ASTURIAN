import { brandState } from '@/client-config/states/brandState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
  CheckoutSessionDocument,
} from '~/generated-metadata/graphql';

export const useHandleCheckoutSession = ({
  recurringInterval,
  plan,
  requirePaymentMethod,
  successUrlPath,
}: {
  recurringInterval: SubscriptionInterval;
  plan: BillingPlanKey;
  requirePaymentMethod: boolean;
  successUrlPath: string;
}) => {
  const { redirect } = useRedirect();

  const { enqueueErrorSnackBar } = useSnackBar();

  const [checkoutSession] = useMutation(CheckoutSessionDocument);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const brand = useAtomStateValue(brandState);
  const productName = brand?.productName || 'Zyra';

  const handleCheckoutSession = async () => {
    setIsSubmitting(true);
    const { data } = await checkoutSession({
      variables: {
        recurringInterval,
        successUrlPath,
        plan,
        requirePaymentMethod,
      },
    });
    setIsSubmitting(false);
    if (!data?.checkoutSession.url) {
      enqueueErrorSnackBar({
        message: t`Checkout session error. Please retry or contact ${productName} team`,
      });
      return;
    }
    redirect(data.checkoutSession.url);
  };
  return { isSubmitting, handleCheckoutSession };
};
