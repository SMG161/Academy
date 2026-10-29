describe('resolveCdnUrl', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  it('returns null for a falsy path', () => {
    delete process.env.CDN_BASE_URL;
    const { resolveCdnUrl } = require('../src/utils/cdn');
    expect(resolveCdnUrl(null)).toBeNull();
    expect(resolveCdnUrl('')).toBeNull();
  });

  it('returns the raw path unchanged when no CDN base URL is configured', () => {
    delete process.env.CDN_BASE_URL;
    jest.resetModules();
    const { resolveCdnUrl } = require('../src/utils/cdn');
    expect(resolveCdnUrl('lectures/abc/video.mp4')).toBe('lectures/abc/video.mp4');
  });

  it('prefixes a protocol-less CDN host with https://', () => {
    process.env.CDN_BASE_URL = 'd123.cloudfront.net';
    jest.resetModules();
    const { resolveCdnUrl } = require('../src/utils/cdn');
    expect(resolveCdnUrl('thumbnails/abc.jpg')).toBe(
      'https://d123.cloudfront.net/thumbnails/abc.jpg'
    );
  });

  it('joins a base URL with a trailing slash and a path with a leading slash without doubling the slash', () => {
    process.env.CDN_BASE_URL = 'https://d123.cloudfront.net/';
    jest.resetModules();
    const { resolveCdnUrl } = require('../src/utils/cdn');
    expect(resolveCdnUrl('/thumbnails/abc.jpg')).toBe(
      'https://d123.cloudfront.net/thumbnails/abc.jpg'
    );
  });
});

describe('withThumbnailUrl', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  it('strips thumbnailPath and adds a null thumbnailUrl when there is no thumbnail', () => {
    delete process.env.CDN_BASE_URL;
    jest.resetModules();
    const { withThumbnailUrl } = require('../src/utils/cdn');

    const result = withThumbnailUrl({ _id: '1', name: 'Course', thumbnailPath: null });

    expect(result).toEqual({ _id: '1', name: 'Course', thumbnailUrl: null });
    expect(result.thumbnailPath).toBeUndefined();
  });

  it('resolves a real thumbnailPath against the CDN base (falls back unsigned when CloudFront signing is not configured)', () => {
    process.env.CDN_BASE_URL = 'd123.cloudfront.net';
    delete process.env.CLOUDFRONT_KEY_PAIR_ID;
    delete process.env.CLOUDFRONT_PRIVATE_KEY_PATH;
    jest.resetModules();
    const { withThumbnailUrl } = require('../src/utils/cdn');

    const result = withThumbnailUrl({ _id: '1', thumbnailPath: 'thumbnails/abc.jpg' });

    expect(result.thumbnailUrl).toBe('https://d123.cloudfront.net/thumbnails/abc.jpg');
    expect(result.thumbnailPath).toBeUndefined();
  });

  it('preserves every other field on the object', () => {
    delete process.env.CDN_BASE_URL;
    jest.resetModules();
    const { withThumbnailUrl } = require('../src/utils/cdn');

    const result = withThumbnailUrl({ _id: '1', name: 'Course', price: 500, thumbnailPath: null });

    expect(result).toMatchObject({ _id: '1', name: 'Course', price: 500 });
  });
});
