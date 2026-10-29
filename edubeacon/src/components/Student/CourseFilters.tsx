import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { GRADE_OPTIONS } from '../../utils/grades';
import type { CourseFilterValues } from './courseFilterTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface FilterOptions {
  subjects: string[];
  teachers: { _id: string; name: string }[];
}

interface CourseFiltersProps {
  values: CourseFilterValues;
  onChange: (values: CourseFilterValues) => void;
}

const selectClassName =
  'px-4 py-2 border border-gray-300 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100';

const CourseFilters = ({ values, onChange }: CourseFiltersProps) => {
  const [options, setOptions] = useState<FilterOptions>({ subjects: [], teachers: [] });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/filters`);
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setOptions({ subjects: data.subjects || [], teachers: data.teachers || [] });
        }
      } catch {
        // Dropdowns just stay empty if this fails — the search box still works.
      }
    };

    fetchOptions();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-[220px]">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={values.search}
          onChange={(e) => onChange({ ...values, search: e.target.value })}
          placeholder="Search courses..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>

      <select
        value={values.teacher}
        onChange={(e) => onChange({ ...values, teacher: e.target.value })}
        className={selectClassName}
      >
        <option value="">All teachers</option>
        {options.teachers.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

      <select
        value={values.subject}
        onChange={(e) => onChange({ ...values, subject: e.target.value })}
        className={selectClassName}
      >
        <option value="">All subjects</option>
        {options.subjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={values.grade}
        onChange={(e) => onChange({ ...values, grade: e.target.value })}
        className={selectClassName}
      >
        <option value="">All grades</option>
        {GRADE_OPTIONS.map((g) => (
          <option key={g} value={g}>
            {g === 'None' ? 'No grade' : g}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CourseFilters;
