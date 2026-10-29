import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/Student/layout/StudentLayout';
import CourseBrowserGrid from '../../components/Student/CourseBrowserGrid';

const BrowseCourses = () => {
  const navigate = useNavigate();

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold mb-6">
        <span className="text-gray-900 dark:text-gray-100">Browse</span>{' '}
        <span className="text-purple-600 dark:text-purple-400">Courses</span>
      </h1>

      <CourseBrowserGrid onSelectCourse={(id) => navigate(`/student/course/${id}`)} />
    </StudentLayout>
  );
};

export default BrowseCourses;
