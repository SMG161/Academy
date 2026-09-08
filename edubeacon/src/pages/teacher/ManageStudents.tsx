import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import TeacherLayout from '../../components/Teacher/layout/TeacherLayout';
import type { StudentSummary } from '../../types/enrollment';
import type { Pagination } from '../../types/pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const STUDENTS_PER_PAGE = 25;

const ManageStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce the email search box before it hits the API and resets to page 1.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchStudents = useCallback(async (pageToFetch: number, emailSearch: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({
        page: String(pageToFetch),
        limit: String(STUDENTS_PER_PAGE),
      });

      // Empty search box -> this teacher's own students. Non-empty -> search
      // any student by email, so the teacher can find someone new to grant to.
      const url = emailSearch
        ? `${API_BASE_URL}/api/teacher/students/search?email=${encodeURIComponent(emailSearch)}&${params.toString()}`
        : `${API_BASE_URL}/api/teacher/students?${params.toString()}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to fetch students');

      setStudents(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(page, search);
  }, [fetchStudents, page, search]);

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <TeacherLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Manage Students</h1>

        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Find a student by their exact email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {isLoading && <p className="text-gray-600 dark:text-gray-400">Loading students...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {search
                      ? 'No student found with that exact email.'
                      : 'No students enrolled in your courses yet.'}
                  </td>
                </tr>
              )}

              {students.map((student, index) => (
                <tr
                  key={student._id}
                  onClick={() => navigate(`/teacher/student/${student._id}`)}
                  className="hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {(page - 1) * STUDENTS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{student.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
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
    </TeacherLayout>
  );
};

export default ManageStudents;
