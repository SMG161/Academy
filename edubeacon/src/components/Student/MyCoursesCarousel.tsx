import CourseCarousel from './CourseCarousel';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const MyCoursesCarousel = () => {
  const { user } = useCurrentUser();
  const myCourses = user?.courses || [];

  return (
    <CourseCarousel
      title={
        <>
          <span className="text-gray-600">My</span>{' '}
          <span className="text-purple-600">Courses</span>
        </>
      }
      courses={myCourses}
    />
  );
};

export default MyCoursesCarousel;
