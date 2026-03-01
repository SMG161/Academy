import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentProtectedRoute from './components/StudentProtectedRoute';
import StudentDashboard from './pages/students/StudentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<StudentProtectedRoute />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
