import { useNavigate, useLocation } from 'react-router-dom';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Courses', path: '/admin/courses' },
  { label: 'Teachers', path: '/admin/teachers' },
  { label: 'Students', path: '/admin/students' },
  { label: 'Admin Users', path: '/admin/admin-users' },
];

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/', { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-gray-900 text-white border-b border-white/5 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 font-bold shadow-md">
          E
        </div>
        <div>
          <p className="text-base font-semibold">EduBeacon</p>
          <p className="text-xs text-gray-400">Admin Dashboard</p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-purple-100 outline outline-1 outline-purple-500/60'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Account settings"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-900/50 hover:bg-red-900/70 text-red-200 hover:text-red-100 transition-colors"
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
