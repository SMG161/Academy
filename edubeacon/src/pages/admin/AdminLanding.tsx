import AdminLayout from '../../components/Admin/AdminLayout';

const AdminLanding = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome, Admin</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Use the links in the header to manage courses, teachers, students and admin users.
      </p>
    </AdminLayout>
  );
};

export default AdminLanding;
