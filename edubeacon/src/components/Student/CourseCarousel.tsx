import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Course } from '../../types/course';

interface CourseCarouselProps {
  title: ReactNode;
  courses: Course[];
}

const CourseCarousel = ({ title, courses }: CourseCarouselProps) => {
  const navigate = useNavigate();

  const handleCourseClick = (courseId: string) => {
    navigate(`/student/course/${courseId}`);
  };

  return (
    <section className="pb-12 px-4 bg-gray-50">
      <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">{title}</h2>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {courses.length === 0 && (
          <div className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-40 w-full bg-gray-200" />

            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        )}

        {courses.map((course) => (
          <div
            key={course._id}
            className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCourseClick(course._id)}
          >
            <div className="h-40 w-full overflow-hidden rounded-t-lg">
              <img
                src="/landing page image.png" // placeholder for now
                alt={course.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.name}</h3>
              <p className="text-sm text-gray-500">
                {course.teacher?.name || 'Unidentified teacher'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseCarousel;
