import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from './CourseCard';

interface CarouselItem {
  _id: string;
  name: string;
  teacher?: { name: string } | null;
  price: number;
  lectures?: { _id: string }[];
}

interface CourseCarouselProps {
  title: ReactNode;
  courses: CarouselItem[];
  linkBase?: string;
  viewAllPath?: string;
}

const CourseCarousel = ({
  title,
  courses,
  linkBase = '/student/course',
  viewAllPath,
}: CourseCarouselProps) => {
  const navigate = useNavigate();

  const handleCourseClick = (id: string) => {
    navigate(`${linkBase}/${id}`);
  };

  return (
    <section className="pb-12 px-4 bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-4xl lg:text-5xl font-bold leading-tight">{title}</h2>

        {viewAllPath && (
          <button
            type="button"
            onClick={() => navigate(viewAllPath)}
            className="flex-shrink-0 text-purple-600 dark:text-purple-400 text-sm font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            View all →
          </button>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {courses.length === 0 && (
          <div className="flex-shrink-0 w-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-40 w-full bg-gray-100 dark:bg-gray-800" />

            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        )}

        {courses.map((course) => (
          <div key={course._id} className="flex-shrink-0 w-64">
            <CourseCard course={course} onClick={handleCourseClick} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseCarousel;
