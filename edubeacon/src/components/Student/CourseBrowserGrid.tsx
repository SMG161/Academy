import { useCallback, useEffect, useState } from 'react';
import CourseCard from './CourseCard';
import CourseFilters from './CourseFilters';
import { EMPTY_COURSE_FILTERS, type CourseFilterValues } from './courseFilterTypes';
import Pagination from './Pagination';
import type { Course } from '../../types/course';
import type { Pagination as PaginationType } from '../../types/pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface CourseBrowserGridProps {
  onSelectCourse: (id: string) => void;
}

// Search + teacher/subject/grade filters + paginated grid, shared by the
// authenticated student Browse Courses page and the public (logged-out)
// Courses page — both hit the same already-public GET /api/courses.
const CourseBrowserGrid = ({ onSelectCourse }: CourseBrowserGridProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [page, setPage] = useState(1);
  const [filterInput, setFilterInput] = useState<CourseFilterValues>(EMPTY_COURSE_FILTERS);
  const [filters, setFilters] = useState<CourseFilterValues>(EMPTY_COURSE_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the search box before it hits the API and resets to page 1.
  // Dropdown filters apply immediately (they're not typed character-by-character).
  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters(filterInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [filterInput]);

  const fetchCourses = useCallback(async (pageToFetch: number, activeFilters: CourseFilterValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ page: String(pageToFetch) });
      if (activeFilters.search.trim()) params.set('search', activeFilters.search.trim());
      if (activeFilters.teacher) params.set('teacher', activeFilters.teacher);
      if (activeFilters.subject) params.set('subject', activeFilters.subject);
      if (activeFilters.grade) params.set('grade', activeFilters.grade);

      const res = await fetch(`${API_BASE_URL}/api/courses?${params.toString()}`);
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
    fetchCourses(page, filters);
  }, [fetchCourses, page, filters]);

  return (
    <>
      <CourseFilters values={filterInput} onChange={setFilterInput} />

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading courses...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {!isLoading && !error && courses.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">No courses match your filters.</p>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} onClick={onSelectCourse} />
          ))}
        </div>
      )}

      {pagination && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      )}
    </>
  );
};

export default CourseBrowserGrid;
