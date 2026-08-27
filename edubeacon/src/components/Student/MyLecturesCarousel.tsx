import { InformationCircleIcon } from '@heroicons/react/24/outline';
import LectureCarousel from './LectureCarousel';
import { useCurrentUser } from '../../hooks/useCurrentUser';

const MyLecturesCarousel = () => {
  const { user } = useCurrentUser();

  // Only lectures bought independently of a fully-owned course
  const standaloneLectures = (user?.lectures || []).filter(
    (lecture) => !user?.courses?.some((course) => course._id === lecture.course._id)
  );

  return (
    <LectureCarousel
      title={
        <span className="inline-flex items-center gap-2">
          <span className="text-gray-600">My</span>{' '}
          <span className="text-purple-600">Lectures</span>
          <span title="Lectures you have bought that are independent of your full courses">
            <InformationCircleIcon className="h-6 w-6 text-gray-400 cursor-help" />
          </span>
        </span>
      }
      lectures={standaloneLectures}
      linkBase="/student/lecture"
    />
  );
};

export default MyLecturesCarousel;
