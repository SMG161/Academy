import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <section className="pb-12 px-4 bg-gray-50">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-4xl lg:text-5xl font-bold leading-tight">{title}</h2>

        {viewAllPath && (
          <button
            type="button"
            onClick={() => navigate(viewAllPath)}
            className="flex-shrink-0 text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors"
          >
            View all →
          </button>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {courses.length === 0 && (
          <div className="flex-shrink-0 w-64 rounded-2xl bg-gray-900 overflow-hidden">
            <div className="h-40 w-full bg-gray-800" />

            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-700" />
            </div>
          </div>
        )}

        {courses.map((course) => {
          const lectureCount = course.lectures?.length ?? 0;

          return (
            <div
              key={course._id}
              className="flex-shrink-0 w-64 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-white/10 overflow-hidden shadow-lg cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all"
              onClick={() => handleCourseClick(course._id)}
            >
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src="/landing page image.png" // placeholder for now
                  alt={course.name}
                  className="w-full h-full object-cover"
                />

                {lectureCount > 0 && (
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-medium px-3 py-1 rounded-full border border-white/10">
                    {lectureCount} {lectureCount === 1 ? 'lecture' : 'lectures'}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-white font-semibold text-base line-clamp-1">{course.name}</h3>
                <p className="text-gray-400 text-sm mt-0.5">
                  {course.teacher?.name || 'Unidentified teacher'}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">Rs. {course.price}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course._id);
                    }}
                    className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
                  >
                    View course
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CourseCarousel;
