import { Navigate, Outlet } from 'react-router-dom';
import { decodeToken } from '../utils/jwt';

const AdminProtectedRoute = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  if (!token || decodeToken(token)?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
