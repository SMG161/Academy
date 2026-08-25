import { useEffect, useState } from 'react';
import CourseCarousel from './CourseCarousel';
import type { Course } from '../../types/course';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const BrowseCoursesCarousel = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/courses`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');

        setCourses(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) return <p className="text-gray-600">Loading courses...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <CourseCarousel
      title={
        <>
          <span className="text-gray-600">Browse</span>{' '}
          <span className="text-purple-600">Courses</span>
        </>
      }
      courses={courses}
    />
  );
};

export default BrowseCoursesCarousel;
