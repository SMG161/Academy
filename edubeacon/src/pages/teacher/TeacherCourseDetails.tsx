import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import TeacherLayout from '../../components/Teacher/layout/TeacherLayout';
import AddLectureModal from '../../components/Teacher/AddLectureModal';
import { decodeToken } from '../../utils/jwt';
import type { LectureSummary } from '../../types/lecture';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface TeacherCourseDetail {
  _id: string;
  name: string;
  description?: string;
  price: number;
  teacher: string | null;
  lectures: LectureSummary[];
}

const TeacherCourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<TeacherCourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCourse = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  if (isLoading) return <TeacherLayout><p className="text-gray-600">Loading course...</p></TeacherLayout>;
  if (error) return <TeacherLayout><p className="text-red-600">{error}</p></TeacherLayout>;
  if (!course) return <TeacherLayout><p className="text-gray-600">Course not found.</p></TeacherLayout>;

  const token = localStorage.getItem('authToken');
  const decoded = token ? decodeToken(token) : null;
  const canManage = decoded?.role === 'admin' || course.teacher === decoded?.userId;
  const lectures = course.lectures || [];

  return (
    <TeacherLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
            {course.name}
          </h1>
          <p className="text-purple-600 font-semibold mt-2">Rs. {course.price}</p>
          <p className="text-gray-600 mt-4 max-w-3xl">
            {course.description || 'No description added yet.'}
          </p>
        </div>

        <div className="w-full bg-white rounded-xl shadow-md divide-y divide-gray-100">
          {lectures.length === 0 && (
            <p className="text-gray-500 text-sm p-6">No lectures added to this course yet.</p>
          )}

          {lectures.map((lecture) => (
            <div
              key={lecture._id}
              className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <VideoCameraIcon className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <span className="text-gray-900 font-medium">{lecture.name}</span>
              </div>
              <span className="text-sm text-gray-500 flex-shrink-0">Rs. {lecture.price}</span>
            </div>
          ))}
        </div>

        {canManage && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-md"
            >
              + Add Lecture
            </button>
          </div>
        )}
      </div>

      {canManage && (
        <AddLectureModal
          isOpen={isModalOpen}
          courseId={course._id}
          onClose={() => setIsModalOpen(false)}
          onCreated={() => {
            setIsModalOpen(false);
            fetchCourse();
          }}
        />
      )}
    </TeacherLayout>
  );
};

export default TeacherCourseDetails;
