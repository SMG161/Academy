import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentProtectedRoute from './components/StudentProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import StudentDashboard from './pages/students/StudentDashboard';
import CourseDetails from './pages/students/CourseDetails';
import LectureDetails from './pages/students/LectureDetails';
import AdminLanding from './pages/admin/AdminLanding';
import Teachers from './pages/admin/Teachers';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Protected student routes */}
        <Route element={<StudentProtectedRoute />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/course/:id" element={<CourseDetails />} />
          <Route path="/student/lecture/:id" element={<LectureDetails />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminLanding />} />
          <Route path="/admin/teachers" element={<Teachers />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;