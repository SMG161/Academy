import { Navigate, Outlet } from 'react-router-dom';

const StudentProtectedRoute = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default StudentProtectedRoute;


