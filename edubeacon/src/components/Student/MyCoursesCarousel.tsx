import { useEffect, useState } from 'react';
import CourseCarousel from './CourseCarousel';
import type { Course } from '../../types/course';
import type { Paginated } from '../../types/pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const MyCoursesCarousel = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/api/students/me/courses?page=1&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Failed to fetch my courses');

        const paginated = data as Paginated<Course>;
        setCourses(paginated.items);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  if (isLoading) return <p className="text-gray-600">Loading your courses...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <CourseCarousel
      title={
        <>
          <span className="text-gray-600">My</span>{' '}
          <span className="text-purple-600">Courses</span>
        </>
      }
      courses={courses}
      viewAllPath="/student/courses"
    />
  );
};

export default MyCoursesCarousel;
