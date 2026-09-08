const { S3Client } = require('@aws-sdk/client-s3');

// WHEN_REQUIRED (not the SDK's default WHEN_SUPPORTED) — otherwise the SDK
// bakes an auto-computed checksum for an empty body into presigned PUT
// URLs, which then fails to match any real upload's content.
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  requestChecksumCalculation: 'WHEN_REQUIRED',
});
const bucketName = process.env.S3_BUCKET_NAME;

module.exports = { s3Client, bucketName };
