const { DAY_MS, computeInitialNotifiedMilestones } = require('../src/utils/notifications');

describe('computeInitialNotifiedMilestones', () => {
  const now = new Date('2026-01-01T12:00:00.000Z');

  it('pre-marks nothing for a grant with plenty of time left', () => {
    const expiresAt = new Date(now.getTime() + 60 * DAY_MS);
    expect(computeInitialNotifiedMilestones(expiresAt, now)).toEqual([]);
  });

  it('pre-marks only the milestones that have already passed for a short grant', () => {
    // 3 days left: the 30-day and 7-day reminders are already "in the past"
    // relative to this grant, but the 1-day reminder is still ahead.
    const expiresAt = new Date(now.getTime() + 3 * DAY_MS);
    expect(computeInitialNotifiedMilestones(expiresAt, now)).toEqual([
      'expiry_30d',
      'expiry_7d',
    ]);
  });

  it('pre-marks everything for a grant that is already effectively expired', () => {
    const expiresAt = new Date(now.getTime() + 1000); // 1 second left
    expect(computeInitialNotifiedMilestones(expiresAt, now)).toEqual([
      'expiry_30d',
      'expiry_7d',
      'expiry_1d',
    ]);
  });

  // Regression test for a real bug: a grant landing on an exact round-number
  // boundary (e.g. "30 days") must NOT have that milestone pre-excluded, or
  // the sweep job would silently never fire the "1 month left" reminder.
  it('does not pre-exclude a milestone that lands exactly on "now"', () => {
    const expiresAt = new Date(now.getTime() + 30 * DAY_MS);
    expect(computeInitialNotifiedMilestones(expiresAt, now)).toEqual([]);
  });

  it('does not pre-exclude a milestone a couple of seconds before "now" (clock jitter)', () => {
    // Simulates the real race: expiresAt was computed a moment before the
    // server reads "now" a few DB round-trips later.
    const expiresAt = new Date(now.getTime() + 30 * DAY_MS - 2000);
    expect(computeInitialNotifiedMilestones(expiresAt, now)).toEqual([]);
  });

  it('does pre-exclude a milestone that is genuinely well in the past', () => {
    const expiresAt = new Date(now.getTime() + 30 * DAY_MS - 10000); // 10s, beyond the epsilon
    expect(computeInitialNotifiedMilestones(expiresAt, now)).toEqual(['expiry_30d']);
  });

  it('defaults "now" to the current time when not provided', () => {
    const expiresAt = new Date(Date.now() + 60 * DAY_MS);
    expect(computeInitialNotifiedMilestones(expiresAt)).toEqual([]);
  });
});
