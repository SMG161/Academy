import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import StudentLayout from '../../components/Student/layout/StudentLayout';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Course } from '../../types/course';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const { user } = useCurrentUser();
  const isEnrolled = Boolean(user?.courses?.some((c) => c._id === id));

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

  useEffect(() => {
    if (!isEnrolled || !id) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const fetchVideoUrl = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}/video`, {
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
  }, [isEnrolled, id]);

  if (isLoading) return <p className="text-gray-600 p-6">Loading course...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!course) return <p className="text-gray-600 p-6">Course not found.</p>;

  return (
    <StudentLayout>
      <div className="space-y-8">
        {/* Course Name */}
        <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
          {course.name}
        </h1>

        {isEnrolled ? (
          /* Video + Info Panel */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Video Player */}
            <div className="flex-1">
              {videoUrl ? (
                <MediaPlayer
                  title={course.name}
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

            {/* Info Panel */}
            <div className="w-full lg:w-72 bg-white rounded-xl shadow-md p-6 flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Teacher
              </h2>
              <p className="text-gray-900 text-base">
                {course.teacher?.name || 'Unidentified teacher'}
              </p>

              <h2 className="text-lg font-semibold text-gray-700 mt-4">
                Description
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {course.description ||
                  'This course contains high-quality lectures and resources designed to help you improve your skills and knowledge in the subject. Follow along and complete the exercises to get the most out of this course.'}
              </p>
            </div>
          </div>
        ) : (
          /* Description only — no access to this course yet */
          <div className="w-full bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {course.description ||
                'This course contains high-quality lectures and resources designed to help you improve your skills and knowledge in the subject. Follow along and complete the exercises to get the most out of this course.'}
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default CourseDetails;