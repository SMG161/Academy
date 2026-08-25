import StudentLayout from '../../components/Student/layout/StudentLayout';
import BrowseCoursesCarousel from '../../components/Student/BrowseCoursesCarousel';
import MyCoursesCarousel from '../../components/Student/MyCoursesCarousel';

const StudentDashboard = () => {
  return (
    <StudentLayout>
      <BrowseCoursesCarousel />
      <MyCoursesCarousel />
    </StudentLayout>
  );
};

export default StudentDashboard;