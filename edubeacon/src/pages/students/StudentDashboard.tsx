import StudentLayout from '../../components/Student/layout/StudentLayout';
import BrowseCoursesCarousel from '../../components/Student/BrowseCoursesCarousel';
import MyCoursesCarousel from '../../components/Student/MyCoursesCarousel';
import MyLecturesCarousel from '../../components/Student/MyLecturesCarousel';

const StudentDashboard = () => {
  return (
    <StudentLayout>
      <BrowseCoursesCarousel />
      <MyCoursesCarousel />
      <MyLecturesCarousel />
    </StudentLayout>
  );
};

export default StudentDashboard;