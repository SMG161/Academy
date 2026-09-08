import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ComponentType, SVGProps } from 'react';
import { BookOpenIcon, UserGroupIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import TeacherLayout from '../../components/Teacher/layout/TeacherLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface StatTileProps {
  label: string;
  value: number | null;
  icon: IconType;
  onClick: () => void;
}

const StatTile = ({ label, value, icon: Icon, onClick }: StatTileProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
  >
    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
      <Icon className="h-6 w-6" />
    </span>
    <span>
      <span className="block text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value === null ? '—' : value}
      </span>
      <span className="block text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </span>
  </button>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [totalCourses, setTotalCourses] = useState<number | null>(null);
  const [totalLectures, setTotalLectures] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchCount = async (path: string, setter: (n: number) => void) => {
      try {
        const res = await fetch(`${API_BASE_URL}${path}?page=1&limit=1`, { headers });
        const data = await res.json().catch(() => ({}));
        if (res.ok) setter(data.pagination?.total ?? 0);
      } catch {
        // Leave the tile showing a dash if the count can't be fetched.
      }
    };

    fetchCount('/api/teacher/students', setTotalStudents);
    fetchCount('/api/teacher/courses', setTotalCourses);
    fetchCount('/api/teacher/lectures', setTotalLectures);
  }, []);

  return (
    <TeacherLayout>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <StatTile
          label="Total Students"
          value={totalStudents}
          icon={UserGroupIcon}
          onClick={() => navigate('/teacher/students')}
        />
        <StatTile
          label="Total Courses"
          value={totalCourses}
          icon={BookOpenIcon}
          onClick={() => navigate('/teacher/courses')}
        />
        <StatTile
          label="Total Lectures"
          value={totalLectures}
          icon={VideoCameraIcon}
          onClick={() => navigate('/teacher/lectures')}
        />
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
