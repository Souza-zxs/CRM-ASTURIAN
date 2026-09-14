import { getStripeClient, verifyEnterpriseKey } from '@/platform/enterprise';

const NON_UPDATABLE_STATUSES = new Set(['canceled', 'incomplete_expired']);

export async function POST(request: Request) {
  if (
    !process.env.STRIPE_SECRET_KEY ||
    !process.env.ENTERPRISE_JWT_PUBLIC_KEY
  ) {
    console.error(
      '[enterprise-seats] 503 — STRIPE_SECRET_KEY and/or ENTERPRISE_JWT_PUBLIC_KEY are not configured',
    );
    return Response.json(
      { error: 'Enterprise seat management is not configured.' },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as {
      enterpriseKey?: unknown;
      seatCount?: unknown;
    };
    const { enterpriseKey, seatCount } = body;

    if (!enterpriseKey || typeof enterpriseKey !== 'string') {
      return Response.json({ error: 'Missing enterpriseKey' }, { status: 400 });
    }

    if (typeof seatCount !== 'number' || seatCount < 1) {
      return Response.json({ error: 'Invalid seatCount' }, { status: 400 });
    }

    const payload = verifyEnterpriseKey(enterpriseKey);

    if (!payload) {
      return Response.json({ error: 'Invalid enterprise key' }, { status: 403 });
    }

    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(payload.sub);

    if (
      NON_UPDATABLE_STATUSES.has(subscription.status) ||
      subscription.cancel_at_period_end
    ) {
      return Response.json({
        success: false,
        reason: 'Subscription is canceled or scheduled for cancellation',
        seatCount: subscription.items.data[0]?.quantity ?? 0,
        subscriptionId: payload.sub,
      });
    }

    if (!subscription.items.data[0]) {
      return Response.json(
        { error: 'No subscription item found' },
        { status: 400 },
      );
    }

    const subscriptionItemId = subscription.items.data[0].id;

    await stripe.subscriptions.update(payload.sub, {
      items: [
        {
          id: subscriptionItemId,
          quantity: seatCount,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    return Response.json({
      success: true,
      seatCount,
      subscriptionId: payload.sub,
    });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    return Response.json(
      { error: `Seat update error: ${message}` },
      { status: 500 },
    );
  }
}
