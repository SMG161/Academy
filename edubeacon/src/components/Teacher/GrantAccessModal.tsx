import { useCallback, useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Calendar from './Calendar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface PickItem {
  _id: string;
  name: string;
  price: number;
  course?: { _id: string; name: string };
}

interface GrantAccessModalProps {
  isOpen: boolean;
  mode: 'course' | 'lecture';
  studentId: string;
  onClose: () => void;
  onGranted: () => void;
}

function toEndOfDayIso(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

const GrantAccessModal = ({ isOpen, mode, studentId, onClose, onGranted }: GrantAccessModalProps) => {
  const [items, setItems] = useState<PickItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listPath = mode === 'course' ? 'available-courses' : 'available-lectures';
  const submitPath = mode === 'course' ? 'courses' : 'lectures';
  const idField = mode === 'course' ? 'courseId' : 'lectureId';

  useEffect(() => {
    if (!isOpen) return;
    setSearchInput('');
    setSearch('');
    setSelectedId(null);
    setSelectedDate(null);
    setError(null);
  }, [isOpen]);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const fetchItems = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams({ page: '1', limit: '20' });
      if (search) params.set('search', search);

      const res = await fetch(
        `${API_BASE_URL}/api/teacher/students/${studentId}/${listPath}?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to load');

      setItems(data.items || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, studentId, listPath, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedId || !selectedDate) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/teacher/students/${studentId}/${submitPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [idField]: selectedId, expiresAt: toEndOfDayIso(selectedDate) }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to grant access');

      onGranted();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'course' ? 'Give Course Access' : 'Give Lecture Access'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold dark:text-gray-400 dark:hover:text-gray-200">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 rounded-md p-3 dark:bg-red-950/40 dark:border-red-800">
            <div className="bg-red-200 text-red-800 text-sm font-medium px-3 py-2 rounded dark:bg-red-900/40 dark:text-red-300">{error}</div>
          </div>
        )}

        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={mode === 'course' ? 'Search courses...' : 'Search lectures...'}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>

        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-56 overflow-y-auto mb-6 dark:border-gray-700 dark:divide-gray-800">
          {isLoading && <p className="text-gray-500 text-sm p-4 dark:text-gray-400">Loading...</p>}
          {!isLoading && items.length === 0 && (
            <p className="text-gray-500 text-sm p-4 dark:text-gray-400">
              {mode === 'course' ? 'No courses available to grant.' : 'No lectures available to grant.'}
            </p>
          )}
          {!isLoading &&
            items.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => setSelectedId(item._id)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                  selectedId === item._id ? 'bg-purple-50 dark:bg-purple-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                  {item.course && <p className="text-xs text-gray-500 dark:text-gray-400">Part of {item.course.name}</p>}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Rs. {item.price}</span>
              </button>
            ))}
        </div>

        {selectedId && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Access expires on</p>
            <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />
          </div>
        )}

        <button
          type="button"
          disabled={!selectedId || !selectedDate || isSubmitting}
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Granting...' : 'Grant Access'}
        </button>
      </div>
    </div>
  );
};

export default GrantAccessModal;
