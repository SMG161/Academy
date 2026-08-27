import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import AddTeacherModal from '../../components/Admin/AddTeacherModal';
import type { Teacher } from '../../types/teacher';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/admin/teachers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => []);

      if (!res.ok) throw new Error(data.message || 'Failed to fetch teachers');

      setTeachers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No teachers yet.
                  </td>
                </tr>
              )}

              {teachers.map((teacher, index) => (
                <tr key={teacher._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{teacher.numCourses}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end mt-6">
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
          fetchTeachers();
        }}
      />
    </AdminLayout>
  );
};

export default Teachers;
