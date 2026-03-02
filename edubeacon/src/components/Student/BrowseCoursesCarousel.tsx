import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Course {
  _id: string;
  name: string;
  teacher?: { name: string } | null;
  videoPath: string;
  price: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const BrowseCoursesCarousel = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleCourseClick = (courseId: string) => {
    navigate(`/student/course/${courseId}`);
  };

  if (isLoading) return <p className="text-gray-600">Loading courses...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <section className="py-12 px-4 bg-gray-50">
      <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
  <span className="text-gray-600">Browse</span>{' '}
  <span className="text-purple-600">Courses</span>
</h2>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {courses.length === 0 && <p>No courses available.</p>}

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

export default BrowseCoursesCarousel;