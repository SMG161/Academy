const PLACEHOLDER_THUMBNAIL = '/landing page image.png';

interface CourseCardItem {
  _id: string;
  name: string;
  teacher?: { name: string } | null;
  price: number;
  lectures?: { _id: string }[];
  thumbnailUrl?: string | null;
}

interface CourseCardProps {
  course: CourseCardItem;
  onClick: (id: string) => void;
}

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  const lectureCount = course.lectures?.length ?? 0;

  return (
    <div
      className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all"
      onClick={() => onClick(course._id)}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={course.thumbnailUrl || PLACEHOLDER_THUMBNAIL}
          alt={course.name}
          className="w-full h-full object-cover"
        />

        {lectureCount > 0 && (
          <span className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-purple-700 dark:text-purple-300 text-xs font-medium px-3 py-1 rounded-full border border-purple-100 dark:border-purple-900/50 shadow-sm">
            {lectureCount} {lectureCount === 1 ? 'lecture' : 'lectures'}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-base line-clamp-1">
          {course.name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          {course.teacher?.name || 'Unidentified teacher'}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm">
            Rs. {course.price}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick(course._id);
            }}
            className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            View course
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
