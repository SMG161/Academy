import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import TeacherLayout from '../../components/Teacher/layout/TeacherLayout';
import GrantAccessModal from '../../components/Teacher/GrantAccessModal';
import EditExpiryModal from '../../components/Teacher/EditExpiryModal';
import type { CourseGrant, LectureGrant, StudentDetailResponse } from '../../types/enrollment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type EditingGrant =
  | { type: 'course'; grant: CourseGrant }
  | { type: 'lecture'; grant: LectureGrant };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const StudentDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState<StudentDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grantModal, setGrantModal] = useState<'course' | 'lecture' | null>(null);
  const [editing, setEditing] = useState<EditingGrant | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/teacher/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json.message || 'Failed to fetch student');

      setData(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleDeleteCourse = async (grantId: string) => {
    if (!window.confirm('Revoke this course access?')) return;

    const token = localStorage.getItem('authToken');
    await fetch(`${API_BASE_URL}/api/teacher/students/${id}/courses/${grantId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDetail();
  };

  const handleDeleteLecture = async (grantId: string) => {
    if (!window.confirm('Revoke this lecture access?')) return;

    const token = localStorage.getItem('authToken');
    await fetch(`${API_BASE_URL}/api/teacher/students/${id}/lectures/${grantId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDetail();
  };

  const handleSaveExpiry = async (newExpiresAt: string) => {
    if (!editing) return;

    const token = localStorage.getItem('authToken');
    const path = editing.type === 'course' ? 'courses' : 'lectures';

    const res = await fetch(
      `${API_BASE_URL}/api/teacher/students/${id}/${path}/${editing.grant.grantId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ expiresAt: newExpiresAt }),
      }
    );
    const json = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(json.message || 'Failed to update expiry');

    setEditing(null);
    fetchDetail();
  };

  if (isLoading) return <TeacherLayout><p className="text-gray-600 dark:text-gray-400">Loading student...</p></TeacherLayout>;
  if (error) return <TeacherLayout><p className="text-red-600 dark:text-red-400">{error}</p></TeacherLayout>;
  if (!data || !id) return <TeacherLayout><p className="text-gray-600 dark:text-gray-400">Student not found.</p></TeacherLayout>;

  return (
    <TeacherLayout>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.student.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{data.student.email}</p>
        </div>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Courses</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.courses.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No course access granted yet.
                    </td>
                  </tr>
                )}

                {data.courses.map((grant) => (
                  <tr key={grant.grantId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{grant.course.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(grant.expiresAt)}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        type="button"
                        onClick={() => setEditing({ type: 'course', grant })}
                        className="text-purple-600 hover:text-purple-800 mr-3 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        <PencilSquareIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(grant.grantId)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setGrantModal('course')}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-md"
            >
              + Give Course Access
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 dark:text-gray-100">Lectures</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.lectures.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No lecture access granted yet.
                    </td>
                  </tr>
                )}

                {data.lectures.map((grant) => (
                  <tr key={grant.grantId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{grant.lecture.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{grant.lecture.course?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(grant.expiresAt)}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        type="button"
                        onClick={() => setEditing({ type: 'lecture', grant })}
                        className="text-purple-600 hover:text-purple-800 mr-3 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        <PencilSquareIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLecture(grant.grantId)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={() => setGrantModal('lecture')}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-md"
            >
              + Give Lecture Access
            </button>
          </div>
        </section>
      </div>

      {grantModal && (
        <GrantAccessModal
          isOpen={Boolean(grantModal)}
          mode={grantModal}
          studentId={id}
          onClose={() => setGrantModal(null)}
          onGranted={() => {
            setGrantModal(null);
            fetchDetail();
          }}
        />
      )}

      {editing && (
        <EditExpiryModal
          isOpen={Boolean(editing)}
          itemName={editing.type === 'course' ? editing.grant.course.name : editing.grant.lecture.name}
          currentExpiresAt={editing.grant.expiresAt}
          onClose={() => setEditing(null)}
          onSave={handleSaveExpiry}
        />
      )}
    </TeacherLayout>
  );
};

export default StudentDetail;
