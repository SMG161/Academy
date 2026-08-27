import AdminLayout from '../../components/Admin/AdminLayout';

const AdminLanding = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900">Welcome, Admin</h1>
      <p className="text-gray-600 mt-2">
        Use the links in the header to manage courses, teachers, students and admin users.
      </p>
    </AdminLayout>
  );
};

export default AdminLanding;
