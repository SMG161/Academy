import { PlayIcon } from '@heroicons/react/24/solid';

const PLACEHOLDER_THUMBNAIL = '/landing page image.png';

interface LectureCardItem {
  _id: string;
  name: string;
  course: { name: string };
  thumbnailUrl?: string | null;
}

interface LectureCardProps {
  lecture: LectureCardItem;
  onClick: (id: string) => void;
}

const LectureCard = ({ lecture, onClick }: LectureCardProps) => (
  <div
    className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all"
    onClick={() => onClick(lecture._id)}
  >
    <div className="relative h-40 w-full overflow-hidden">
      <img
        src={lecture.thumbnailUrl || PLACEHOLDER_THUMBNAIL}
        alt={lecture.name}
        className="w-full h-full object-cover"
      />

      <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-purple-700 dark:text-purple-300 text-xs font-medium px-3 py-1 rounded-full border border-purple-100 dark:border-purple-900/50 shadow-sm">
        Lecture
      </span>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 dark:bg-gray-900/90 border border-purple-100 dark:border-purple-900/50 shadow-md backdrop-blur">
          <PlayIcon className="h-5 w-5 text-purple-600 dark:text-purple-400 translate-x-0.5" />
        </span>
      </div>
    </div>

    <div className="p-4">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{lecture.course?.name}</p>
      <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-base line-clamp-1 mt-0.5">
        {lecture.name}
      </h3>

      <div className="mt-3 flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick(lecture._id);
          }}
          className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          Watch
        </button>
      </div>
    </div>
  </div>
);

export default LectureCard;
