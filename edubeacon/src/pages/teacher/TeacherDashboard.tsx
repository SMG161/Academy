import TeacherLayout from '../../components/Teacher/layout/TeacherLayout';

const TeacherDashboard = () => {
  return (
    <TeacherLayout>
      <h1 className="text-3xl font-bold text-gray-900">Welcome, Teacher</h1>
      <p className="text-gray-600 mt-2">
        Use the sidebar to manage your courses and students.
      </p>
    </TeacherLayout>
  );
};

export default TeacherDashboard;
