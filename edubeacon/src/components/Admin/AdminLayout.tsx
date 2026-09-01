import type { ReactNode } from 'react';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <AdminHeader />

      <main className="pt-16">
        <div className="px-6 md:px-10 py-10">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
