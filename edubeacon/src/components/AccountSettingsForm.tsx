import { type FormEvent, useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface Account {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const AccountSettingsForm = () => {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateConfirmed, setDeactivateConfirmed] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const fetchAccount = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/account/me`, {
          headers: authHeaders(),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data.message || 'Failed to load account.');

        setAccount(data);
        setName(data.name);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, []);

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();
    setNameMessage(null);
    setNameError(null);
    setIsSavingName(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/account/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to update name.');

      setAccount(data);
      setNameMessage('Name updated successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setNameError(message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/account/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to update password.');

      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setPasswordError(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeactivate = async (e: FormEvent) => {
    e.preventDefault();
    setDeactivateError(null);

    if (!deactivateConfirmed) {
      setDeactivateError('Please confirm you understand before continuing.');
      return;
    }

    setIsDeactivating(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/account/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ password: deactivatePassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || 'Failed to deactivate account.');

      // Full reload, not just a route change: clears every bit of cached
      // state tied to the now-invalid session, not just the current page.
      localStorage.removeItem('authToken');
      window.location.href = '/';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setDeactivateError(message);
      setIsDeactivating(false);
    }
  };

  if (isLoading) return <p className="text-gray-600 dark:text-gray-400">Loading account settings...</p>;
  if (loadError) return <p className="text-red-600 dark:text-red-400">{loadError}</p>;
  if (!account) return null;

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile and password.</p>
      </div>

      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile</h2>

        {nameMessage && <p className="text-sm text-green-600 dark:text-green-400 mb-3">{nameMessage}</p>}
        {nameError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{nameError}</p>}

        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={account.email}
              disabled
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingName}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingName ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Change Password</h2>

        {passwordMessage && (
          <p className="text-sm text-green-600 dark:text-green-400 mb-3">{passwordMessage}</p>
        )}
        {passwordError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{passwordError}</p>}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Current password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Confirm new password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSavingPassword}
            className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSavingPassword ? 'Saving...' : 'Update password'}
          </button>
        </form>
      </section>

      {account.role !== 'admin' && (
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {account.role === 'teacher'
              ? 'Deactivating your account signs you out everywhere immediately and disables sign-in. Your courses and lectures stay intact, and students who already have access keep it. Contact support to reactivate.'
              : 'Deactivating your account signs you out everywhere immediately and disables sign-in. Your account and data are permanently deleted once your course and lecture access has expired, or 30 days after deactivation — whichever is later. Contact support if you change your mind before then.'}
          </p>

          {deactivateError && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{deactivateError}</p>}

          <form onSubmit={handleDeactivate} className="space-y-4">
            <div>
              <label
                htmlFor="deactivatePassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Confirm your password
              </label>
              <input
                type="password"
                id="deactivatePassword"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="deactivateConfirmed"
                checked={deactivateConfirmed}
                onChange={(e) => setDeactivateConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-800"
              />
              <label htmlFor="deactivateConfirmed" className="text-sm text-gray-600 dark:text-gray-400">
                I understand this will sign me out of all devices immediately.
              </label>
            </div>

            <button
              type="submit"
              disabled={isDeactivating || !deactivateConfirmed}
              className="bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isDeactivating ? 'Deactivating...' : 'Deactivate my account'}
            </button>
          </form>
        </section>
      )}
    </div>
  );
};

export default AccountSettingsForm;
