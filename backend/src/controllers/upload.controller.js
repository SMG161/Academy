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

const UPLOAD_URL_EXPIRY_SECONDS = 15 * 60;

// Issues a short-lived, signed S3 PUT URL scoped to the requesting
// teacher/admin's own upload namespace, so only they can name that key.
exports.getLectureUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ message: 'fileName and fileType are required' });
    }

    if (!ALLOWED_VIDEO_TYPES.has(fileType)) {
      return res.status(400).json({ message: 'Unsupported video type' });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `lectures/${req.user.userId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    });

    res.json({ uploadUrl, videoPath: key });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
