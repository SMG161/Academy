import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { uploadThumbnail, uploadVideo } from '../../utils/mediaUpload';
import { MAX_VIDEO_SIZE_BYTES, formatFileSize } from '../../utils/uploadLimits';
import { captureVideoFrame } from '../../utils/videoThumbnail';

interface EditLectureModalProps {
  isOpen: boolean;
  lectureId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const EditLectureModal = ({ isOpen, lectureId, onClose, onUpdated }: EditLectureModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [isCapturingThumbnail, setIsCapturingThumbnail] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLecture = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures/${lectureId}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Failed to load lecture');

        setName(data.name || '');
        setPrice(String(data.price ?? ''));
        setDescription(data.description || '');
        setCurrentThumbnailUrl(data.thumbnailUrl || null);
        setVideoFile(null);
        setThumbnailBlob(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchLecture();
  }, [isOpen, lectureId]);

  useEffect(() => {
    if (!thumbnailBlob) {
      setThumbnailPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(thumbnailBlob);
    setThumbnailPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbnailBlob]);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && file.size > MAX_VIDEO_SIZE_BYTES) {
      setError(`Video files must be ${formatFileSize(MAX_VIDEO_SIZE_BYTES)} or smaller`);
      e.target.value = '';
      setVideoFile(null);
      setThumbnailBlob(null);
      return;
    }

    setError(null);
    setVideoFile(file);
    setThumbnailBlob(null);

    if (file) {
      setIsCapturingThumbnail(true);
      captureVideoFrame(file).then((blob) => {
        setThumbnailBlob(blob);
        setIsCapturingThumbnail(false);
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setUploadPercent(videoFile ? 0 : null);

    try {
      const token = localStorage.getItem('authToken');

      let videoPath: string | undefined;
      if (videoFile) {
        videoPath = await uploadVideo(videoFile, token, setUploadPercent);
      }

      // Best-effort: a captured video frame is a nice-to-have, never blocks
      // the update if the presign or upload fails.
      let thumbnailPath: string | undefined;
      if (videoFile && thumbnailBlob) {
        try {
          thumbnailPath = await uploadThumbnail(
            thumbnailBlob,
            `${videoFile.name.replace(/\.[^./]+$/, '')}-thumb.jpg`,
            token
          );
        } catch {
          // Ignore — lecture is still updated without a new thumbnail.
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/lectures/${lectureId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          videoPath,
          thumbnailPath,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      onUpdated();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
      setUploadPercent(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Lecture</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 rounded-md p-3 dark:bg-red-950/40 dark:border-red-800">
            <div className="bg-red-200 text-red-800 text-sm font-medium px-3 py-2 rounded dark:bg-red-900/40 dark:text-red-300">
              {error}
            </div>
          </div>
        )}

        {isFetching ? (
          <p className="text-gray-600 dark:text-gray-400">Loading lecture...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-lecture-name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="edit-lecture-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder="Enter lecture name"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-lecture-price" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Price
              </label>
              <input
                type="number"
                id="edit-lecture-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder="Enter lecture price"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label
                htmlFor="edit-lecture-description"
                className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
              >
                Description <span className="text-gray-400 font-normal dark:text-gray-500">(optional)</span>
              </label>
              <textarea
                id="edit-lecture-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder="Describe this lecture"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="edit-lecture-video" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Video <span className="text-gray-400 font-normal dark:text-gray-500">(optional — leave blank to keep current video)</span>
              </label>

              {currentThumbnailUrl && !thumbnailPreviewUrl && (
                <img
                  src={currentThumbnailUrl}
                  alt="Current thumbnail"
                  className="h-16 w-28 object-cover rounded border border-gray-200 dark:border-gray-700 mb-2"
                />
              )}

              <input
                type="file"
                id="edit-lecture-video"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-50 file:text-purple-700 file:font-semibold hover:file:bg-purple-100 dark:text-gray-400 dark:file:bg-purple-950/40 dark:file:text-purple-300 dark:hover:file:bg-purple-900/40"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Max {formatFileSize(MAX_VIDEO_SIZE_BYTES)}.</p>

              {isCapturingThumbnail && (
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Generating thumbnail from video...</p>
              )}
              {!isCapturingThumbnail && thumbnailPreviewUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={thumbnailPreviewUrl}
                    alt="New thumbnail preview"
                    className="h-12 w-20 object-cover rounded border border-gray-200 dark:border-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">New thumbnail captured from video</p>
                </div>
              )}
            </div>

            {uploadPercent !== null && (
              <div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
                  <div
                    className="h-full bg-purple-600 transition-all"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Uploading video... {uploadPercent}%</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditLectureModal;
