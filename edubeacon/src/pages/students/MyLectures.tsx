import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import StudentLayout from '../../components/Student/layout/StudentLayout';
import LectureCard from '../../components/Student/LectureCard';
import Pagination from '../../components/Student/Pagination';
import type { Lecture } from '../../types/lecture';
import type { Pagination as PaginationType } from '../../types/pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const MyLectures = () => {
  const navigate = useNavigate();
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLectures = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/students/me/lectures?page=${pageToFetch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to fetch your lectures');

      setLectures(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLectures(page);
  }, [fetchLectures, page]);

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold mb-6 inline-flex items-center gap-2">
        <span className="text-gray-900 dark:text-gray-100">My</span>{' '}
        <span className="text-purple-600 dark:text-purple-400">Lectures</span>
        <span title="Lectures you have bought that are independent of your full courses">
          <InformationCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 cursor-help" />
        </span>
      </h1>

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading your lectures...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {!isLoading && !error && lectures.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          You don't have access to any individual lectures yet.
        </p>
      )}

      {!isLoading && !error && lectures.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lectures.map((lecture) => (
            <LectureCard
              key={lecture._id}
              lecture={lecture}
              onClick={(id) => navigate(`/student/lecture/${id}`)}
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

export default MyLectures;
