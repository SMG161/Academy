import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import LectureCard from './LectureCard';

interface LectureCarouselItem {
  _id: string;
  name: string;
  course: { name: string };
}

interface LectureCarouselProps {
  title: ReactNode;
  lectures: LectureCarouselItem[];
  linkBase?: string;
  viewAllPath?: string;
}

const LectureCarousel = ({
  title,
  lectures,
  linkBase = '/student/lecture',
  viewAllPath,
}: LectureCarouselProps) => {
  const navigate = useNavigate();

  const handleLectureClick = (id: string) => {
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
        {lectures.length === 0 && (
          <div className="flex-shrink-0 w-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-40 w-full bg-gray-100 dark:bg-gray-800" />

            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800" />
            </div>
          </div>
        )}

        {lectures.map((lecture) => (
          <div key={lecture._id} className="flex-shrink-0 w-64">
            <LectureCard lecture={lecture} onClick={handleLectureClick} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LectureCarousel;
