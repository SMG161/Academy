import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { decodeToken } from '../utils/jwt';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type Status = 'verifying' | 'success' | 'error';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('verifying');
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Verification failed.');

        setStatus('success');

        if (data.token) {
          localStorage.setItem('authToken', data.token);
          const decoded = decodeToken(data.token);
          const destinationByRole: Record<string, string> = {
            admin: '/admin/dashboard',
            teacher: '/teacher/dashboard',
          };
          const destination = destinationByRole[decoded?.role || ''] || '/student/dashboard';

          setTimeout(() => navigate(destination, { replace: true }), 1500);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        setStatus('error');
        setError(message);
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md text-center dark:bg-gray-900">
        {status === 'verifying' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Verifying your email...</h1>
            <p className="text-gray-500 dark:text-gray-400">Hang tight, this will only take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Email verified!</h1>
            <p className="text-gray-500 dark:text-gray-400">Redirecting you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Verification failed</h1>
            <p className="text-red-600 mb-6 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors"
            >
              Back to home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
