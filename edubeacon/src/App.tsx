import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import SetPassword from './pages/SetPassword';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import StudentProtectedRoute from './components/StudentProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import TeacherProtectedRoute from './components/TeacherProtectedRoute';
import StudentDashboard from './pages/students/StudentDashboard';
import CourseDetails from './pages/students/CourseDetails';
import LectureDetails from './pages/students/LectureDetails';
import MyCourses from './pages/students/MyCourses';
import MyLectures from './pages/students/MyLectures';
import BrowseCourses from './pages/students/BrowseCourses';
import AdminLanding from './pages/admin/AdminLanding';
import Teachers from './pages/admin/Teachers';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ManageCourses from './pages/teacher/ManageCourses';
import TeacherCourseDetails from './pages/teacher/TeacherCourseDetails';
import ManageLectures from './pages/teacher/ManageLectures';
import TeacherLectureDetails from './pages/teacher/TeacherLectureDetails';
import ManageStudents from './pages/teacher/ManageStudents';
import StudentDetail from './pages/teacher/StudentDetail';
import StudentAccountSettings from './pages/students/AccountSettings';
import TeacherAccountSettings from './pages/teacher/AccountSettings';

function App() {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Protected student routes */}
        <Route element={<StudentProtectedRoute />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<MyCourses />} />
          <Route path="/student/lectures" element={<MyLectures />} />
          <Route path="/student/browse-courses" element={<BrowseCourses />} />
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
          <Route path="/teacher/lectures" element={<ManageLectures />} />
          <Route path="/teacher/lecture/:id" element={<TeacherLectureDetails />} />
          <Route path="/teacher/students" element={<ManageStudents />} />
          <Route path="/teacher/student/:id" element={<StudentDetail />} />
          <Route path="/teacher/settings" element={<TeacherAccountSettings />} />
        </Route>
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;