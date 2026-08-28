import { Navigate, Outlet } from 'react-router-dom';
import { decodeToken } from '../utils/jwt';

const TeacherProtectedRoute = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  if (!token || decodeToken(token)?.role !== 'teacher') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default TeacherProtectedRoute;
