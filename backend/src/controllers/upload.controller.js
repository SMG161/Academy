const crypto = require('crypto');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, bucketName } = require('../utils/s3Client');

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-matroska',
]);

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const UPLOAD_URL_EXPIRY_SECONDS = 15 * 60;

const MAX_VIDEO_SIZE_BYTES = 3 * 1024 * 1024 * 1024; // 3 GB
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function isValidFileSize(fileSize) {
  return typeof fileSize === 'number' && Number.isFinite(fileSize) && fileSize > 0;
}

// Issues a short-lived, signed S3 PUT URL scoped to the requesting
// teacher/admin's own upload namespace, so only they can name that key.
// The URL is signed against the declared fileSize, so S3 will reject any
// PUT whose actual Content-Length doesn't match it — this is what makes
// the size cap a real limit rather than an advisory one.
exports.getLectureUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, fileSize } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ message: 'fileName and fileType are required' });
    }

    if (!ALLOWED_VIDEO_TYPES.has(fileType)) {
      return res.status(400).json({ message: 'Unsupported video type' });
    }

    if (!isValidFileSize(fileSize)) {
      return res.status(400).json({ message: 'fileSize is required' });
    }

    if (fileSize > MAX_VIDEO_SIZE_BYTES) {
      return res.status(400).json({ message: 'Video files must be 3GB or smaller' });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `lectures/${req.user.userId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    });

    res.json({ uploadUrl, videoPath: key });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Issues a short-lived, signed S3 PUT URL for a course/lecture thumbnail
// image, scoped to the requesting teacher/admin's own upload namespace.
exports.getThumbnailUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, fileSize } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ message: 'fileName and fileType are required' });
    }

    if (!ALLOWED_IMAGE_TYPES.has(fileType)) {
      return res.status(400).json({ message: 'Unsupported image type' });
    }

    if (!isValidFileSize(fileSize)) {
      return res.status(400).json({ message: 'fileSize is required' });
    }

    if (fileSize > MAX_IMAGE_SIZE_BYTES) {
      return res.status(400).json({ message: 'Thumbnail images must be 10MB or smaller' });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `thumbnails/${req.user.userId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    });

    res.json({ uploadUrl, thumbnailPath: key });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
