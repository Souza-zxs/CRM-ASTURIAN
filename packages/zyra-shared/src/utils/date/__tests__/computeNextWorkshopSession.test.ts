import { computeNextWorkshopSession } from '../computeNextWorkshopSession';

// Brasília time (UTC-3), two sessions a day.
const schedule = {
  timesOfDay: ['12:00', '20:00'],
  utcOffsetMinutes: -180,
  minLeadMinutes: 10,
};

describe('computeNextWorkshopSession', () => {
  it('should pick the next session later the same day', () => {
    // 09:00 in Brasília -> 12:00 in Brasília (15:00 UTC).
    const result = computeNextWorkshopSession({
      signupAt: new Date('2026-09-25T12:00:00.000Z'),
      schedule,
    });

    expect(result?.toISOString()).toBe('2026-09-25T15:00:00.000Z');
  });

  it('should move to the following session when the first one already passed', () => {
    // 13:00 in Brasília -> 20:00 in Brasília (23:00 UTC).
    const result = computeNextWorkshopSession({
      signupAt: new Date('2026-09-25T16:00:00.000Z'),
      schedule,
    });

    expect(result?.toISOString()).toBe('2026-09-25T23:00:00.000Z');
  });

  it('should roll over to the next day after the last session', () => {
    // 21:00 in Brasília -> 12:00 the next day (15:00 UTC).
    const result = computeNextWorkshopSession({
      signupAt: new Date('2026-09-26T00:00:00.000Z'),
      schedule,
    });

    expect(result?.toISOString()).toBe('2026-09-26T15:00:00.000Z');
  });

  it('should skip a session that starts sooner than the minimum lead time', () => {
    // 11:55 in Brasília, 5 min before the 12:00 session (min lead is 10).
    const result = computeNextWorkshopSession({
      signupAt: new Date('2026-09-25T14:55:00.000Z'),
      schedule,
    });

    expect(result?.toISOString()).toBe('2026-09-25T23:00:00.000Z');
  });

  it('should accept a session exactly at the minimum lead time', () => {
    // 11:50 in Brasília, exactly 10 min before the 12:00 session.
    const result = computeNextWorkshopSession({
      signupAt: new Date('2026-09-25T14:50:00.000Z'),
      schedule,
    });

    expect(result?.toISOString()).toBe('2026-09-25T15:00:00.000Z');
  });

  it('should use the local calendar day, not the UTC one', () => {
    // 22:30 UTC is already 19:30 in Brasília, still before the 20:00 session
    // of the same local day even though it is late in UTC.
    const result = computeNextWorkshopSession({
      signupAt: new Date('2026-09-25T22:30:00.000Z'),
      schedule,
    });

    expect(result?.toISOString()).toBe('2026-09-25T23:00:00.000Z');
  });

  it('should ignore invalid times and use the valid ones', () => {
    const result = computeNextWorkshopSession({
      signupAt: new Date('2026-09-25T12:00:00.000Z'),
      schedule: { ...schedule, timesOfDay: ['25:99', 'noite', '20:00'] },
    });

    expect(result?.toISOString()).toBe('2026-09-25T23:00:00.000Z');
  });

  it('should return null when there is no valid time', () => {
    expect(
      computeNextWorkshopSession({
        signupAt: new Date('2026-09-25T12:00:00.000Z'),
        schedule: { ...schedule, timesOfDay: [] },
      }),
    ).toBeNull();
  });
});
