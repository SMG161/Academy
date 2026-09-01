import { useEffect, useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import LectureCarousel from './LectureCarousel';
import type { Lecture } from '../../types/lecture';
import type { Paginated } from '../../types/pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const MyLecturesCarousel = () => {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyLectures = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/api/students/me/lectures?page=1&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Failed to fetch my lectures');

        const paginated = data as Paginated<Lecture>;
        setLectures(paginated.items);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyLectures();
  }, []);

  if (isLoading) return <p className="text-gray-600 dark:text-gray-400">Loading your lectures...</p>;
  if (error) return <p className="text-red-600 dark:text-red-400">{error}</p>;

  return (
    <LectureCarousel
      title={
        <span className="inline-flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-300">My</span>{' '}
          <span className="text-purple-600 dark:text-purple-400">Lectures</span>
          <span title="Lectures you have bought that are independent of your full courses">
            <InformationCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 cursor-help" />
          </span>
        </span>
      }
      lectures={lectures}
      linkBase="/student/lecture"
      viewAllPath="/student/lectures"
    />
  );
};

export default MyLecturesCarousel;
