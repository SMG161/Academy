const { signVideoUrl } = require('./cloudfrontSign');

const rawCdnBaseUrl = process.env.CDN_BASE_URL || '';
const CDN_BASE_URL = rawCdnBaseUrl && !/^https?:\/\//i.test(rawCdnBaseUrl)
  ? `https://${rawCdnBaseUrl}`
  : rawCdnBaseUrl;

// Resolves a raw S3 key (video/thumbnail path) against the CDN base URL.
function resolveCdnUrl(path) {
  if (!path) return null;
  if (!CDN_BASE_URL) return path;
  return `${CDN_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

// Strips thumbnailPath (a raw S3 key) off a plain object and replaces it
// with a resolved, signed thumbnailUrl. The distribution requires signed
// URLs for every path (not just lecture video), so this needs the same
// CloudFront signing as playback URLs.
function withThumbnailUrl(obj) {
  const { thumbnailPath, ...rest } = obj;
  const cdnUrl = resolveCdnUrl(thumbnailPath);
  return { ...rest, thumbnailUrl: cdnUrl ? signVideoUrl(cdnUrl) : null };
}

module.exports = { resolveCdnUrl, withThumbnailUrl };
