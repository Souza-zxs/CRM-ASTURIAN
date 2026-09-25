import { type FunnelWorkshopSchedule } from '../../types/FunnelPageContent';

const MINUTE_IN_MS = 60_000;
const DAY_IN_MS = 86_400_000;
const TIME_OF_DAY_FORMAT = /^([01]\d|2[0-3]):([0-5]\d)$/;
// A slot always exists within 24h of the earliest start, but the day the
// search begins on may already be over, so look one day past that.
const DAYS_TO_SEARCH = 3;

const parseTimeOfDayInMinutes = (timeOfDay: string): number | null => {
  const match = TIME_OF_DAY_FORMAT.exec(timeOfDay.trim());

  if (match === null) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
};

// Returns the first session start (as an instant) that is at least
// `minLeadMinutes` after the signup, or null when the schedule has no valid
// "HH:mm" time. Pure and dependency-free so the server and the public page
// agree on the same session for the same lead.
export const computeNextWorkshopSession = ({
  signupAt,
  schedule,
}: {
  signupAt: Date;
  schedule: FunnelWorkshopSchedule;
}): Date | null => {
  const sessionMinutesOfDay = schedule.timesOfDay
    .map(parseTimeOfDayInMinutes)
    .filter((minutes): minutes is number => minutes !== null);

  if (sessionMinutesOfDay.length === 0) {
    return null;
  }

  const offsetInMs = schedule.utcOffsetMinutes * MINUTE_IN_MS;
  const earliestStartMs =
    signupAt.getTime() + Math.max(schedule.minLeadMinutes, 0) * MINUTE_IN_MS;

  // Shifting by the offset makes UTC arithmetic behave like the schedule's
  // local clock, so "start of the local day" is a plain floor to 24h.
  const firstLocalDayStartMs =
    Math.floor((earliestStartMs + offsetInMs) / DAY_IN_MS) * DAY_IN_MS;

  const candidatesMs = Array.from({ length: DAYS_TO_SEARCH }, (_, dayIndex) =>
    sessionMinutesOfDay.map(
      (minutes) =>
        firstLocalDayStartMs +
        dayIndex * DAY_IN_MS +
        minutes * MINUTE_IN_MS -
        offsetInMs,
    ),
  )
    .flat()
    .filter((candidateMs) => candidateMs >= earliestStartMs);

  return new Date(Math.min(...candidatesMs));
};
