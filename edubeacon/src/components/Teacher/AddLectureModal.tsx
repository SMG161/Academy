import { type ChangeEvent, type FormEvent, useState } from 'react';

interface AddLectureModalProps {
  isOpen: boolean;
  courseId: string;
  onClose: () => void;
  onCreated: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function uploadToS3(uploadUrl: string, file: File, onProgress: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error('Video upload failed'));
    };

    xhr.onerror = () => reject(new Error('Video upload failed'));

    xhr.send(file);
  });
}

const AddLectureModal = ({ isOpen, courseId, onClose, onCreated }: AddLectureModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setVideoFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    setIsLoading(true);
    setUploadPercent(0);

    try {
      const token = localStorage.getItem('authToken');

      const presignRes = await fetch(`${API_BASE_URL}/api/uploads/lecture-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName: videoFile.name, fileType: videoFile.type }),
      });

      const presignData = await presignRes.json().catch(() => ({}));

      if (!presignRes.ok) {
        throw new Error(presignData.message || 'Failed to prepare upload');
      }

      await uploadToS3(presignData.uploadUrl, videoFile, setUploadPercent);

      const lectureRes = await fetch(`${API_BASE_URL}/api/lectures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          course: courseId,
          description,
          price: Number(price),
          videoPath: presignData.videoPath,
        }),
      });

      const lectureData = await lectureRes.json().catch(() => ({}));

      if (!lectureRes.ok) {
        throw new Error(lectureData.message || 'Failed to create lecture');
      }

      setName('');
      setPrice('');
      setDescription('');
      setVideoFile(null);
      onCreated();
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Lecture</h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="lecture-name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="lecture-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
              placeholder="Enter lecture name"
              required
            />
          </div>

          <div>
            <label htmlFor="lecture-price" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Price
            </label>
            <input
              type="number"
              id="lecture-price"
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
              htmlFor="lecture-description"
              className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
            >
              Description <span className="text-gray-400 font-normal dark:text-gray-500">(optional)</span>
            </label>
            <textarea
              id="lecture-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
              placeholder="Describe this lecture"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="lecture-video" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Video
            </label>
            <input
              type="file"
              id="lecture-video"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-50 file:text-purple-700 file:font-semibold hover:file:bg-purple-100 dark:text-gray-400 dark:file:bg-purple-950/40 dark:file:text-purple-300 dark:hover:file:bg-purple-900/40"
              required
            />
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
            {isLoading ? 'Adding...' : 'Add Lecture'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddLectureModal;
