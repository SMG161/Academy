import StudentLayout from '../../components/Student/layout/StudentLayout';
import BrowseCoursesCarousel from '../../components/Student/BrowseCoursesCarousel';

const StudentDashboard = () => {
  return (
    <StudentLayout>
      {/* Only render the carousel here */}
      <BrowseCoursesCarousel />

      {/* Other dashboard content can go below */}
      <section className="mt-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome Back 👋</h2>
        <p className="text-gray-600">
          This is your dashboard. Your enrolled courses, progress, and recommendations will appear here.
        </p>
      </section>
    </StudentLayout>
  );
};

export default StudentDashboard;