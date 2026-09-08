import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PencilIcon } from '@heroicons/react/24/outline';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import TeacherLayout from '../../components/Teacher/layout/TeacherLayout';
import EditLectureModal from '../../components/Teacher/EditLectureModal';
import { decodeToken } from '../../utils/jwt';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface TeacherLectureDetail {
  _id: string;
  name: string;
  description?: string;
  price: number;
  course: { _id: string; name: string };
  teacher: { _id: string; name: string } | null;
}

const TeacherLectureDetails = () => {
  const { id } = useParams();
  const [lecture, setLecture] = useState<TeacherLectureDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isEditingLecture, setIsEditingLecture] = useState(false);

  const fetchLecture = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/lectures/${id}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to fetch lecture');

      setLecture(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLecture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setHasAccess(false);
      return;
    }

    const fetchAccess = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures/${id}/access`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));

        setHasAccess(res.ok ? Boolean(data.hasAccess) : false);
      } catch {
        setHasAccess(false);
      }
    };

    fetchAccess();
  }, [id]);

  useEffect(() => {
    if (!hasAccess || !id) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const fetchVideoUrl = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/lectures/${id}/video`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Failed to fetch video');

        setVideoUrl(data.videoUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      }
    };

    fetchVideoUrl();
  }, [hasAccess, id]);

  if (isLoading) return <TeacherLayout><p className="text-gray-600 dark:text-gray-400">Loading lecture...</p></TeacherLayout>;
  if (error) return <TeacherLayout><p className="text-red-600 dark:text-red-400">{error}</p></TeacherLayout>;
  if (!lecture) return <TeacherLayout><p className="text-gray-600 dark:text-gray-400">Lecture not found.</p></TeacherLayout>;

  const token = localStorage.getItem('authToken');
  const decoded = token ? decodeToken(token) : null;
  const canManage = decoded?.role === 'admin' || lecture.teacher?._id === decoded?.userId;

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900 dark:text-gray-100">
              {lecture.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Part of {lecture.course.name}</p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsEditingLecture(true)}
              title="Edit lecture"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-purple-400"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        {hasAccess === null ? (
          <div className="w-full h-80 lg:h-[450px] rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        ) : hasAccess ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {videoUrl ? (
                <MediaPlayer
                  title={lecture.name}
                  src={videoUrl}
                  viewType="video"
                  streamType="on-demand"
                  playsInline
                  className="w-full h-80 lg:h-[450px] rounded-lg overflow-hidden shadow-2xl"
                >
                  <MediaProvider />
                  <DefaultVideoLayout icons={defaultLayoutIcons} />
                </MediaPlayer>
              ) : (
                <div className="w-full h-80 lg:h-[450px] rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
              )}
            </div>

            <div className="w-full lg:w-72 bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Price</h2>
              <p className="text-gray-900 dark:text-gray-100 text-base">Rs. {lecture.price}</p>

              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">
                Description
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {lecture.description || 'No description added yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {lecture.description || 'No description added yet.'}
            </p>
          </div>
        )}
      </div>

      {canManage && (
        <EditLectureModal
          isOpen={isEditingLecture}
          lectureId={lecture._id}
          onClose={() => setIsEditingLecture(false)}
          onUpdated={() => {
            setIsEditingLecture(false);
            fetchLecture();
          }}
        />
      )}
    </TeacherLayout>
  );
};

export default TeacherLectureDetails;
