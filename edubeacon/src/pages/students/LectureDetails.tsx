import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import StudentLayout from '../../components/Student/layout/StudentLayout';
import type { Lecture } from '../../types/lecture';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const LectureDetails = () => {
  const { id } = useParams();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
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

    fetchLecture();
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
        setExpiresAt(res.ok ? data.expiresAt || null : null);
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

  if (isLoading) return <p className="text-gray-600 p-6">Loading lecture...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!lecture) return <p className="text-gray-600 p-6">Lecture not found.</p>;

  return (
    <StudentLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
            {lecture.name}
          </h1>
          <p className="text-gray-500 mt-2">Part of {lecture.course.name}</p>
          {hasAccess && expiresAt && (
            <p className="text-sm text-purple-600 mt-1">Access expires on {formatDate(expiresAt)}</p>
          )}
        </div>

        {hasAccess === null ? (
          <div className="w-full h-80 lg:h-[450px] rounded-lg bg-gray-200 animate-pulse" />
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
                <div className="w-full h-80 lg:h-[450px] rounded-lg bg-gray-200 animate-pulse" />
              )}
            </div>

            <div className="w-full lg:w-72 bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-700">Teacher</h2>
              <p className="text-gray-900 text-base">
                {lecture.teacher?.name || 'Unidentified teacher'}
              </p>

              <h2 className="text-lg font-semibold text-gray-700 mt-4">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {lecture.description ||
                  'This lecture contains high-quality content designed to help you improve your skills and knowledge in the subject.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {lecture.description ||
                'This lecture contains high-quality content designed to help you improve your skills and knowledge in the subject.'}
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default LectureDetails;
