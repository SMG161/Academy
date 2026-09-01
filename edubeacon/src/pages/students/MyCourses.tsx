import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/Student/layout/StudentLayout';
import CourseCard from '../../components/Student/CourseCard';
import Pagination from '../../components/Student/Pagination';
import type { Course } from '../../types/course';
import type { Pagination as PaginationType } from '../../types/pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/students/me/courses?page=${pageToFetch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to fetch your courses');

      setCourses(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(page);
  }, [fetchCourses, page]);

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold mb-6">
        <span className="text-gray-900 dark:text-gray-100">My</span>{' '}
        <span className="text-purple-600 dark:text-purple-400">Courses</span>
      </h1>

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading your courses...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {!isLoading && !error && courses.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">You don't have access to any courses yet.</p>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onClick={(id) => navigate(`/student/course/${id}`)}
            />
          ))}
        </div>
      )}

      {pagination && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}
    </StudentLayout>
  );
};

export default MyCourses;
