const fs = require('fs');
const { getSignedUrl } = require('@aws-sdk/cloudfront-signer');

const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
const privateKeyPath = process.env.CLOUDFRONT_PRIVATE_KEY_PATH;
const privateKey = privateKeyPath && fs.existsSync(privateKeyPath)
  ? fs.readFileSync(privateKeyPath, 'utf8')
  : undefined;

const DEFAULT_EXPIRY_SECONDS = 60 * 60; // 1 hour

// Signs a CloudFront URL so it only works for a limited time.
// Falls back to returning the plain URL if signing isn't configured yet.
function signVideoUrl(url, expiresInSeconds = DEFAULT_EXPIRY_SECONDS) {
  if (!keyPairId || !privateKey) {
    console.warn('CloudFront signing is not configured (CLOUDFRONT_KEY_PAIR_ID / CLOUDFRONT_PRIVATE_KEY_PATH) — returning unsigned URL');
    return url;
  }

  const dateLessThan = new Date(Date.now() + expiresInSeconds * 1000).toISOString();

  return getSignedUrl({
    url,
    keyPairId,
    privateKey,
    dateLessThan,
  });
}

module.exports = { signVideoUrl };
