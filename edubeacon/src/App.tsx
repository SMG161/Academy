import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import StudentProtectedRoute from './components/StudentProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import TeacherProtectedRoute from './components/TeacherProtectedRoute';
import StudentDashboard from './pages/students/StudentDashboard';
import CourseDetails from './pages/students/CourseDetails';
import LectureDetails from './pages/students/LectureDetails';
import AdminLanding from './pages/admin/AdminLanding';
import Teachers from './pages/admin/Teachers';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ManageCourses from './pages/teacher/ManageCourses';
import TeacherCourseDetails from './pages/teacher/TeacherCourseDetails';
import ManageStudents from './pages/teacher/ManageStudents';
import StudentDetail from './pages/teacher/StudentDetail';
import StudentAccountSettings from './pages/students/AccountSettings';
import TeacherAccountSettings from './pages/teacher/AccountSettings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected student routes */}
        <Route element={<StudentProtectedRoute />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/course/:id" element={<CourseDetails />} />
          <Route path="/student/lecture/:id" element={<LectureDetails />} />
          <Route path="/student/settings" element={<StudentAccountSettings />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminLanding />} />
          <Route path="/admin/teachers" element={<Teachers />} />
        </Route>

        {/* Protected teacher routes */}
        <Route element={<TeacherProtectedRoute />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<ManageCourses />} />
          <Route path="/teacher/course/:id" element={<TeacherCourseDetails />} />
          <Route path="/teacher/students" element={<ManageStudents />} />
          <Route path="/teacher/student/:id" element={<StudentDetail />} />
          <Route path="/teacher/settings" element={<TeacherAccountSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;