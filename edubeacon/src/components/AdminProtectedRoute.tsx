import { Navigate, Outlet } from 'react-router-dom';

function getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.role ?? null;
  } catch {
    return null;
  }
}

const AdminProtectedRoute = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  if (!token || getRoleFromToken(token) !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
