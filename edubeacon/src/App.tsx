import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentProtectedRoute from './components/StudentProtectedRoute';
import StudentDashboard from './pages/students/StudentDashboard';
import CourseDetails from './pages/students/CourseDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Protected student routes */}
        <Route element={<StudentProtectedRoute />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/course/:id" element={<CourseDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;