import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StudentLayout from '../../components/Student/layout/StudentLayout';

interface Course {
  _id: string;
  name: string;
  teacher?: { name: string } | null;
  videoPath: string;
  description?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        {/* Video + Info Panel */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Video Player */}
          <div className="flex-1">
            <video
              src={`http://localhost:3000/${course.videoPath}`} // adjust if using static route like /videos
              controls
              autoPlay={false}
              className="w-full h-80 lg:h-[450px] rounded-lg shadow-2xl object-cover"
            />
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
      </div>
    </StudentLayout>
  );
};

export default CourseDetails;