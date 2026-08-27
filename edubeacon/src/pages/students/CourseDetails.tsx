import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LockClosedIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import StudentLayout from '../../components/Student/layout/StudentLayout';
import type { Course } from '../../types/course';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface CourseAccess {
  isEnrolledInCourse: boolean;
  purchasedLectureIds: string[];
}

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [access, setAccess] = useState<CourseAccess | null>(null);

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
    if (!id) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const fetchAccess = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${id}/access`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok) setAccess(data);
      } catch {
        // Lectures just render as locked until access resolves.
      }
    };

    fetchAccess();
  }, [id]);

  if (isLoading) return <p className="text-gray-600 p-6">Loading course...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!course) return <p className="text-gray-600 p-6">Course not found.</p>;

  const lectures = course.lectures || [];

  return (
    <StudentLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
            {course.name}
          </h1>
          <p className="text-gray-600 mt-2">{course.teacher?.name || 'Unidentified teacher'}</p>
        </div>

        <div className="w-full bg-white rounded-xl shadow-md divide-y divide-gray-100">
          {lectures.length === 0 && (
            <p className="text-gray-500 text-sm p-6">No lectures available in this course yet.</p>
          )}

          {lectures.map((lecture) => {
            const hasAccess =
              access?.isEnrolledInCourse || access?.purchasedLectureIds.includes(lecture._id);

            return (
              <div
                key={lecture._id}
                className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigate(`/student/lecture/${lecture._id}`)}
              >
                <div className="flex items-center gap-3">
                  {hasAccess ? (
                    <PlayCircleIcon className="h-6 w-6 text-purple-600 flex-shrink-0" />
                  ) : (
                    <LockClosedIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="text-gray-900 font-medium">{lecture.name}</span>
                </div>

                {!hasAccess && (
                  <span className="text-sm text-gray-500 flex-shrink-0">Rs. {lecture.price}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
};

export default CourseDetails;
