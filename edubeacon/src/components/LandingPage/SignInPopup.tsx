import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type View = 'credentials' | 'otp' | 'forgot' | 'forgotSent';

const SignInPopup = ({ isOpen, onClose }: SignInPopupProps) => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>('credentials');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setView('credentials');
    setEmail('');
    setPassword('');
    setError(null);
    setNeedsVerification(false);
    setResendMessage(null);
    setOtpCode('');
    setOtpError(null);
    setOtpMessage(null);
    setForgotEmail('');
    setForgotError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const redirectAfterLogin = (role: string | undefined) => {
    const destinationByRole: Record<string, string> = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
    };
    navigate(destinationByRole[role || ''] || '/student/dashboard');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResendMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername: email,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setNeedsVerification(true);
        }
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      if (data.requiresOtp) {
        setOtpMessage(data.message || 'Enter the verification code sent to your email.');
        setView('otp');
        return;
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      handleClose();
      redirectAfterLogin(data.user?.role);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      setResendMessage(data.message || 'Verification email resent.');
    } catch {
      setResendMessage('Could not resend right now. Please try again shortly.');
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setIsOtpLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired code.');
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      handleClose();
      redirectAfterLogin(data.user?.role);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setOtpError(message);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpError(null);
    setOtpMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Could not resend right now. Please try again shortly.');
      }

      setOtpMessage(data.message || 'A new code has been sent to your email.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not resend right now. Please try again shortly.';
      setOtpError(message);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setIsForgotLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setView('forgotSent');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setForgotError(message);
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 dark:bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {view === 'otp'
              ? 'Enter verification code'
              : view === 'forgot' || view === 'forgotSent'
              ? 'Reset password'
              : 'Sign In'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold dark:text-gray-400 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>

        {view === 'credentials' && (
          <>
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 rounded-md p-3 dark:bg-red-950/40 dark:border-red-800">
                <div className="bg-red-200 text-red-800 text-sm font-medium px-3 py-2 rounded dark:bg-red-900/40 dark:text-red-300">
                  {error}
                </div>
                {needsVerification && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="mt-2 text-sm text-purple-700 font-semibold hover:underline dark:text-purple-400"
                  >
                    Resend verification email
                  </button>
                )}
                {resendMessage && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{resendMessage}</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Email/Username
                </label>
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  placeholder="Enter your email or username"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotError(null);
                      setView('forgot');
                    }}
                    className="text-sm text-purple-600 hover:underline dark:text-purple-400"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        )}

        {view === 'otp' && (
          <>
            <p className="text-gray-600 text-sm mb-4 dark:text-gray-400">
              We sent a 6-digit code to <span className="font-semibold">{email}</span>.
            </p>

            {otpError && (
              <div className="mb-4 bg-red-100 border border-red-400 rounded-md p-3 dark:bg-red-950/40 dark:border-red-800">
                <div className="bg-red-200 text-red-800 text-sm font-medium px-3 py-2 rounded dark:bg-red-900/40 dark:text-red-300">
                  {otpError}
                </div>
              </div>
            )}

            {otpMessage && !otpError && (
              <div className="mb-4 bg-green-100 border border-green-400 rounded-md p-3 dark:bg-green-950/40 dark:border-green-800">
                <div className="text-green-800 text-sm font-medium px-1 dark:text-green-300">{otpMessage}</div>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  6-digit code
                </label>
                <input
                  type="text"
                  id="otpCode"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent tracking-widest text-center text-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isOtpLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isOtpLoading ? 'Verifying...' : 'Verify & sign in'}
              </button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setView('credentials')}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-purple-600 hover:underline dark:text-purple-400"
                >
                  Resend code
                </button>
              </div>
            </form>
          </>
        )}

        {view === 'forgot' && (
          <>
            <p className="text-gray-600 text-sm mb-4 dark:text-gray-400">
              Enter your account email and we'll send you a link to reset your password.
            </p>

            {forgotError && (
              <div className="mb-4 bg-red-100 border border-red-400 rounded-md p-3 dark:bg-red-950/40 dark:border-red-800">
                <div className="bg-red-200 text-red-800 text-sm font-medium px-3 py-2 rounded dark:bg-red-900/40 dark:text-red-300">
                  {forgotError}
                </div>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isForgotLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isForgotLoading ? 'Sending...' : 'Send reset link'}
              </button>

              <button
                type="button"
                onClick={() => setView('credentials')}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Back to sign in
              </button>
            </form>
          </>
        )}

        {view === 'forgotSent' && (
          <div className="text-center py-4">
            <p className="text-gray-700 mb-6 dark:text-gray-300">
              If an account exists for <span className="font-semibold">{forgotEmail}</span>, a
              password reset link has been sent to it.
            </p>
            <button
              type="button"
              onClick={() => setView('credentials')}
              className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors"
            >
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignInPopup;
