const { DAY_MS } = require('../src/utils/notifications');
const { computePurgeEligibleAt, PURGE_GRACE_MS } = require('../src/jobs/studentPurge');

describe('computePurgeEligibleAt', () => {
  const deactivatedAt = new Date('2026-01-01T00:00:00.000Z');

  it('falls back to 30 days after deactivation when there are no grants', () => {
    expect(computePurgeEligibleAt(deactivatedAt, [])).toEqual(
      new Date(deactivatedAt.getTime() + PURGE_GRACE_MS)
    );
  });

  it('falls back to 30 days after deactivation when every grant already expired before then', () => {
    const grantExpiries = [
      new Date(deactivatedAt.getTime() - 5 * DAY_MS),
      new Date(deactivatedAt.getTime() - 1 * DAY_MS),
    ];
    expect(computePurgeEligibleAt(deactivatedAt, grantExpiries)).toEqual(
      new Date(deactivatedAt.getTime() + PURGE_GRACE_MS)
    );
  });

  it('uses the latest grant expiry when a grant outlasts the 30-day grace period', () => {
    // Deactivated today, but holds a course grant that doesn't expire for 90 days.
    const farFutureExpiry = new Date(deactivatedAt.getTime() + 90 * DAY_MS);
    const grantExpiries = [new Date(deactivatedAt.getTime() + 2 * DAY_MS), farFutureExpiry];

    expect(computePurgeEligibleAt(deactivatedAt, grantExpiries)).toEqual(farFutureExpiry);
  });

  it('picks the 30-day grace floor when it is later than the latest grant expiry', () => {
    // A grant expires in just 3 days, well inside the 30-day grace period.
    const grantExpiries = [new Date(deactivatedAt.getTime() + 3 * DAY_MS)];

    expect(computePurgeEligibleAt(deactivatedAt, grantExpiries)).toEqual(
      new Date(deactivatedAt.getTime() + PURGE_GRACE_MS)
    );
  });
});
