import { fetchFunnelLeadSignupTime } from '@/funnel/api/fetch-funnel-lead-signup-time';
import { type FunnelWorkshopSchedule } from '@/funnel/types/FunnelPage';
import { useEffect, useState } from 'react';
import { computeNextWorkshopSession } from 'zyra-shared/utils';

export type WorkshopSession =
  | { status: 'loading' }
  | { status: 'waiting'; startsAt: Date; secondsLeft: number }
  | { status: 'live' };

// Decides whether the visitor watches the workshop now or waits for the
// session they were placed in. Anything that can't be resolved (no schedule,
// no lead id in the URL, unknown lead, network error) resolves to "live":
// a countdown is a nicety, and getting stuck behind one is worse than
// showing the video early.
export const useWorkshopSession = ({
  schedule,
  leadId,
}: {
  schedule: FunnelWorkshopSchedule | undefined;
  leadId: string | null;
}): WorkshopSession => {
  // undefined = still resolving, null = no session to wait for.
  const [startsAt, setStartsAt] = useState<Date | null | undefined>(undefined);
  const [now, setNow] = useState(() => Date.now());

  const isScheduled = schedule !== undefined && leadId !== null;

  useEffect(() => {
    if (schedule === undefined || leadId === null) {
      return;
    }

    let cancelled = false;

    fetchFunnelLeadSignupTime(leadId).then((signedUpAt) => {
      if (cancelled) {
        return;
      }

      setNow(Date.now());
      setStartsAt(
        signedUpAt === null
          ? null
          : computeNextWorkshopSession({ signupAt: signedUpAt, schedule }),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [schedule, leadId]);

  const isWaiting = startsAt instanceof Date && now < startsAt.getTime();

  useEffect(() => {
    if (!isWaiting) {
      return;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(intervalId);
  }, [isWaiting]);

  if (!isScheduled) {
    return { status: 'live' };
  }

  if (startsAt === undefined) {
    return { status: 'loading' };
  }

  if (startsAt === null || now >= startsAt.getTime()) {
    return { status: 'live' };
  }

  return {
    status: 'waiting',
    startsAt,
    secondsLeft: Math.ceil((startsAt.getTime() - now) / 1000),
  };
};
