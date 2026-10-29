import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LockClosedIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import {
  MediaPlayer,
  MediaProvider,
  type MediaPlayerInstance,
  type MediaTimeUpdateEventDetail,
} from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import PublicPageLayout from '../components/LandingPage/PublicPageLayout';
import type { Course } from '../types/course';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const PublicCourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewLectureId, setPreviewLectureId] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewSeconds, setPreviewSeconds] = useState(300);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const playerRef = useRef<MediaPlayerInstance>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Failed to fetch course');

        setCourse(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const lectures = course?.lectures || [];
  const firstLectureId = lectures[0]?._id;

  const handlePreviewClick = async (lectureId: string) => {
    setPreviewError(null);
    setPreviewEnded(false);
    setPreviewLectureId(lectureId);
    setPreviewVideoUrl(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/lectures/${lectureId}/preview`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'This lecture is not available for preview.');

      setPreviewVideoUrl(data.videoUrl);
      setPreviewSeconds(data.previewSeconds || 300);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setPreviewError(message);
    }
  };

  const handleTimeUpdate = (detail: MediaTimeUpdateEventDetail) => {
    if (!previewEnded && detail.currentTime >= previewSeconds) {
      setPreviewEnded(true);
      playerRef.current?.pause();
    }
  };

  if (isLoading) {
    return (
      <PublicPageLayout>
        <p className="text-gray-600 dark:text-gray-400">Loading course...</p>
      </PublicPageLayout>
    );
  }

  if (error) {
    return (
      <PublicPageLayout>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </PublicPageLayout>
    );
  }

  if (!course) {
    return (
      <PublicPageLayout>
        <p className="text-gray-600 dark:text-gray-400">Course not found.</p>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900 dark:text-gray-100">
            {course.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {course.teacher?.name || 'Unidentified teacher'}
          </p>
          {(course.subject || (course.grade && course.grade !== 'None')) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {[course.subject, course.grade && course.grade !== 'None' ? `Grade ${course.grade}` : null]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          <p className="text-purple-600 dark:text-purple-400 font-semibold mt-2">Rs. {course.price}</p>
        </div>

        {previewLectureId && (
          <div className="relative">
            {previewVideoUrl ? (
              <MediaPlayer
                ref={playerRef}
                title={lectures.find((l) => l._id === previewLectureId)?.name}
                src={previewVideoUrl}
                viewType="video"
                streamType="on-demand"
                playsInline
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-80 lg:h-[450px] rounded-lg overflow-hidden shadow-2xl"
              >
                <MediaProvider />
                <DefaultVideoLayout icons={defaultLayoutIcons} />
              </MediaPlayer>
            ) : previewError ? (
              <p className="text-red-600 dark:text-red-400">{previewError}</p>
            ) : (
              <div className="w-full h-80 lg:h-[450px] rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
            )}

            {previewEnded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 rounded-lg text-white text-center p-6">
                <p className="text-lg font-semibold">That's the free preview!</p>
                <p className="text-sm text-gray-300 max-w-sm">
                  Sign up or sign in to keep watching this lecture and the rest of the course.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="bg-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors"
                >
                  Sign up / Sign in
                </button>
              </div>
            )}
          </div>
        )}

        <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-md divide-y divide-gray-100 dark:divide-gray-800">
          {lectures.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm p-6">
              No lectures available in this course yet.
            </p>
          )}

          {lectures.map((lecture) => {
            const isPreview = lecture._id === firstLectureId;

            return (
              <div
                key={lecture._id}
                className={`flex items-center justify-between gap-4 p-4 transition-colors ${
                  isPreview ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                }`}
                onClick={() => isPreview && handlePreviewClick(lecture._id)}
              >
                <div className="flex items-center gap-3">
                  {isPreview ? (
                    <PlayCircleIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  ) : (
                    <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  )}
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{lecture.name}</span>
                </div>

                {isPreview ? (
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium flex-shrink-0">
                    Free preview
                  </span>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                    Rs. {lecture.price}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-md"
          >
            Sign up to get full access
          </button>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default PublicCourseDetails;
