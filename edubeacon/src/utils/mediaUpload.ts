import { MAX_IMAGE_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES, formatFileSize } from './uploadLimits';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function authHeaders(token: string | null) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export function putToS3(uploadUrl: string, file: Blob, onProgress?: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error('Upload failed'));
    };

    xhr.onerror = () => reject(new Error('Upload failed'));

    xhr.send(file);
  });
}

export function validateImageSize(file: Blob) {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error(`Thumbnail images must be ${formatFileSize(MAX_IMAGE_SIZE_BYTES)} or smaller`);
  }
}

export function validateVideoSize(file: Blob) {
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(`Video files must be ${formatFileSize(MAX_VIDEO_SIZE_BYTES)} or smaller`);
  }
}

// Presigns + uploads a thumbnail image, returning its S3 key (thumbnailPath).
export async function uploadThumbnail(file: Blob, fileName: string, token: string | null): Promise<string> {
  validateImageSize(file);

  const presignRes = await fetch(`${API_BASE_URL}/api/uploads/thumbnail`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ fileName, fileType: file.type, fileSize: file.size }),
  });

  const presignData = await presignRes.json().catch(() => ({}));

  if (!presignRes.ok) {
    throw new Error(presignData.message || 'Failed to prepare thumbnail upload');
  }

  await putToS3(presignData.uploadUrl, file);
  return presignData.thumbnailPath;
}

// Presigns + uploads a lecture video, returning its S3 key (videoPath).
export async function uploadVideo(
  file: File,
  token: string | null,
  onProgress: (percent: number) => void
): Promise<string> {
  validateVideoSize(file);

  const presignRes = await fetch(`${API_BASE_URL}/api/uploads/lecture-video`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
  });

  const presignData = await presignRes.json().catch(() => ({}));

  if (!presignRes.ok) {
    throw new Error(presignData.message || 'Failed to prepare upload');
  }

  await putToS3(presignData.uploadUrl, file, onProgress);
  return presignData.videoPath;
}
