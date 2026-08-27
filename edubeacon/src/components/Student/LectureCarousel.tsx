import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayIcon } from '@heroicons/react/24/solid';

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
        {lectures.length === 0 && (
          <div className="flex-shrink-0 w-64 rounded-2xl bg-gray-900 overflow-hidden">
            <div className="h-40 w-full bg-gray-800" />

            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-700" />
              <div className="h-3 w-1/2 rounded bg-gray-700" />
            </div>
          </div>
        )}

        {lectures.map((lecture) => (
          <div
            key={lecture._id}
            className="flex-shrink-0 w-64 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-white/10 overflow-hidden shadow-lg cursor-pointer hover:-translate-y-0.5 hover:shadow-xl transition-all"
            onClick={() => handleLectureClick(lecture._id)}
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src="/landing page image.png" // placeholder for now
                alt={lecture.name}
                className="w-full h-full object-cover"
              />

              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-xs font-medium px-3 py-1 rounded-full border border-white/10">
                Lecture
              </span>

              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 border border-white/40 backdrop-blur">
                  <PlayIcon className="h-5 w-5 text-white translate-x-0.5" />
                </span>
              </div>
            </div>

            <div className="p-4">
              <p className="text-gray-400 text-sm">{lecture.course?.name}</p>
              <h3 className="text-white font-semibold text-base line-clamp-1 mt-0.5">
                {lecture.name}
              </h3>

              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLectureClick(lecture._id);
                  }}
                  className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
                >
                  Watch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LectureCarousel;
