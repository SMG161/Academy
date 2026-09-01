import { useCallback, useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/Admin/AdminLayout';
import AddTeacherModal from '../../components/Admin/AddTeacherModal';
import type { Teacher } from '../../types/teacher';
import type { Pagination } from '../../types/pagination';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const TEACHERS_PER_PAGE = 25;

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeachers = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(
        `${API_BASE_URL}/api/admin/teachers?page=${pageToFetch}&limit=${TEACHERS_PER_PAGE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to fetch teachers');

      setTeachers(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers(page);
  }, [fetchTeachers, page]);

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Teachers</h1>

      {isLoading && <p className="text-gray-600">Loading teachers...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Num Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Activated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No teachers yet.
                  </td>
                </tr>
              )}

              {teachers.map((teacher, index) => (
                <tr key={teacher._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(page - 1) * TEACHERS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{teacher.numCourses}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {teacher.isVerified ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-md"
        >
          + Add Teacher
        </button>
      </div>

      <AddTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          fetchTeachers(page);
        }}
      />
    </AdminLayout>
  );
};

export default Teachers;
