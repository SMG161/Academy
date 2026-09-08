import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, PencilIcon } from '@heroicons/react/24/outline';
import TeacherLayout from '../../components/Teacher/layout/TeacherLayout';
import AddCourseModal from '../../components/Teacher/AddCourseModal';
import EditCourseModal from '../../components/Teacher/EditCourseModal';
import type { TeacherCourseSummary } from '../../types/course';
import type { Pagination } from '../../types/pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const COURSES_PER_PAGE = 10;

const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<TeacherCourseSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Debounce the search box before it hits the API and resets to page 1.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchCourses = useCallback(async (pageToFetch: number, searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: String(pageToFetch),
        limit: String(COURSES_PER_PAGE),
      });
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`${API_BASE_URL}/api/teacher/courses?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to fetch courses');

      setCourses(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(page, search);
  }, [fetchCourses, page, search]);

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <TeacherLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Manage Courses</h1>

        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search your courses..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading courses...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 col-span-full">
              {search ? 'No courses match your search.' : 'You have not created any courses yet.'}
            </p>
          )}

          {courses.map((course) => (
            <div
              key={course._id}
              onClick={() => navigate(`/teacher/course/${course._id}`)}
              className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all dark:bg-gray-900 dark:border-gray-700"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCourseId(course._id);
                }}
                title="Edit course"
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-purple-600 transition-colors dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-purple-400"
              >
                <PencilIcon className="h-4 w-4" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 pr-8 dark:text-gray-100">{course.name}</h3>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2 min-h-[2.5rem] dark:text-gray-400">
                {course.description || 'No description added yet.'}
              </p>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {course.numLectures} {course.numLectures === 1 ? 'lecture' : 'lectures'}
                </span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">Rs. {course.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-md"
        >
          + Add Course
        </button>
      </div>

      <AddCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          fetchCourses(page, search);
        }}
      />

      {editingCourseId && (
        <EditCourseModal
          isOpen={Boolean(editingCourseId)}
          courseId={editingCourseId}
          onClose={() => setEditingCourseId(null)}
          onUpdated={() => {
            setEditingCourseId(null);
            fetchCourses(page, search);
          }}
        />
      )}
    </TeacherLayout>
  );
};

export default ManageCourses;
