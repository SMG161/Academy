const { getPagination, buildPagination } = require('../src/utils/pagination');

function mockReq(query) {
  return { query };
}

describe('getPagination', () => {
  it('falls back to page 1 and the default limit when nothing is provided', () => {
    const { page, limit, skip } = getPagination(mockReq({}), { defaultLimit: 10, maxLimit: 50 });
    expect(page).toBe(1);
    expect(limit).toBe(10);
    expect(skip).toBe(0);
  });

  it('respects a valid page and limit from the query string', () => {
    const { page, limit, skip } = getPagination(mockReq({ page: '3', limit: '5' }), {
      defaultLimit: 10,
      maxLimit: 50,
    });
    expect(page).toBe(3);
    expect(limit).toBe(5);
    expect(skip).toBe(10); // (3 - 1) * 5
  });

  it('clamps a limit above maxLimit down to maxLimit', () => {
    const { limit } = getPagination(mockReq({ limit: '1000' }), { defaultLimit: 10, maxLimit: 27 });
    expect(limit).toBe(27);
  });

  it('treats a page below 1 as page 1', () => {
    const { page } = getPagination(mockReq({ page: '0' }), {});
    expect(page).toBe(1);
  });

  it('treats a non-numeric page/limit as unset', () => {
    const { page, limit } = getPagination(mockReq({ page: 'abc', limit: 'xyz' }), {
      defaultLimit: 15,
      maxLimit: 50,
    });
    expect(page).toBe(1);
    expect(limit).toBe(15);
  });
});

describe('buildPagination', () => {
  it('computes totalPages by dividing total by limit, rounded up', () => {
    expect(buildPagination({ page: 1, limit: 10, total: 25 })).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  it('never reports fewer than 1 total page, even with zero results', () => {
    expect(buildPagination({ page: 1, limit: 10, total: 0 }).totalPages).toBe(1);
  });

  it('reports exactly one page when total equals limit', () => {
    expect(buildPagination({ page: 1, limit: 10, total: 10 }).totalPages).toBe(1);
  });
});
