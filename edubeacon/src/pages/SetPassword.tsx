import { type FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing invite token.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmNewPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to set password.');

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md">
        {success ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account activated!</h1>
            <p className="text-gray-500 mb-6">You can now sign in with your new password.</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors"
            >
              Back to home
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Welcome to EduBeacon</h1>
            <p className="text-gray-500 text-sm mb-6 text-center">
              Set a password to activate your teacher account.
            </p>

            {!token && (
              <p className="text-red-600 text-sm mb-4 text-center">
                Missing or invalid invite link.
              </p>
            )}

            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 rounded-md p-3">
                <div className="bg-red-200 text-red-800 text-sm font-medium px-3 py-2 rounded">
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Activating...' : 'Activate account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SetPassword;
