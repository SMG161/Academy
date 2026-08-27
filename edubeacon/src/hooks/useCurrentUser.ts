import { useEffect, useState } from 'react';
import type { Course } from '../types/course';
import type { Lecture } from '../types/lecture';

interface CurrentUser {
  _id: string;
  email: string;
  username?: string;
  role: string;
  courses?: Course[];
  lectures?: Lecture[]; // lectures the student has bought individually
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      return;
    }

    const fetchCurrentUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/students/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Failed to fetch current user');

        setUser(data.user);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return { user, isLoading, error };
}
