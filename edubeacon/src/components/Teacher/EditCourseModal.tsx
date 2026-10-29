import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { uploadThumbnail } from '../../utils/mediaUpload';
import { MAX_IMAGE_SIZE_BYTES, formatFileSize } from '../../utils/uploadLimits';
import { GRADE_OPTIONS } from '../../utils/grades';

interface EditCourseModalProps {
  isOpen: boolean;
  courseId: string;
  onClose: () => void;
  onUpdated: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const EditCourseModal = ({ isOpen, courseId, onClose, onUpdated }: EditCourseModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('None');
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCourse = async () => {
      setIsFetching(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Failed to load course');

        setName(data.name || '');
        setPrice(String(data.price ?? ''));
        setDescription(data.description || '');
        setSubject(data.subject || '');
        setGrade(data.grade || 'None');
        setCurrentThumbnailUrl(data.thumbnailUrl || null);
        setThumbnailFile(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourse();
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file && file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Thumbnail images must be ${formatFileSize(MAX_IMAGE_SIZE_BYTES)} or smaller`);
      e.target.value = '';
      setThumbnailFile(null);
      return;
    }

    setError(null);
    setThumbnailFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');

      let thumbnailPath: string | undefined;
      if (thumbnailFile) {
        thumbnailPath = await uploadThumbnail(thumbnailFile, thumbnailFile.name, token);
      }

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price: Number(price), description, subject, grade, thumbnailPath }),
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Course</h2>
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
          <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-course-name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="edit-course-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder="Enter course name"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-course-price" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Price
              </label>
              <input
                type="number"
                id="edit-course-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder="Enter course price"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-course-subject" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Subject <span className="text-gray-400 font-normal dark:text-gray-500">(optional)</span>
                </label>
                <input
                  type="text"
                  id="edit-course-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  placeholder="e.g. Mathematics"
                />
              </div>

              <div>
                <label htmlFor="edit-course-grade" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Grade
                </label>
                <select
                  id="edit-course-grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                >
                  {GRADE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option === 'None' ? 'No grade' : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-course-description"
                className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300"
              >
                Description <span className="text-gray-400 font-normal dark:text-gray-500">(optional)</span>
              </label>
              <textarea
                id="edit-course-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder="Describe this course"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="edit-course-thumbnail" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Thumbnail <span className="text-gray-400 font-normal dark:text-gray-500">(optional — leave blank to keep current)</span>
              </label>

              {currentThumbnailUrl && !thumbnailFile && (
                <img
                  src={currentThumbnailUrl}
                  alt="Current thumbnail"
                  className="h-16 w-28 object-cover rounded border border-gray-200 dark:border-gray-700 mb-2"
                />
              )}

              <input
                type="file"
                id="edit-course-thumbnail"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailChange}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-50 file:text-purple-700 file:font-semibold hover:file:bg-purple-100 dark:text-gray-400 dark:file:bg-purple-950/40 dark:file:text-purple-300 dark:hover:file:bg-purple-900/40"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Max {formatFileSize(MAX_IMAGE_SIZE_BYTES)}.</p>
            </div>

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

export default EditCourseModal;
