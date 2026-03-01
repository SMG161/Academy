import type { ComponentType, SVGProps } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  id: string;
  label: string;
  icon: IconType;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/student/dashboard' },
  { id: 'my-courses', label: 'My Courses', icon: BookOpenIcon, path: '/student/courses' },
  {
    id: 'browse-courses',
    label: 'Browse Courses',
    icon: AcademicCapIcon,
    path: '/student/browse-courses',
  },
];

interface SidePanelProps {
  isCollapsed: boolean;
}

const SidePanel = ({ isCollapsed }: SidePanelProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/', { replace: true });
  };

  const widthClass = isCollapsed ? 'w-20' : 'w-72';

  return (
    <aside
      className={`flex h-screen ${widthClass} flex-col justify-between rounded-r-3xl bg-gradient-to-b from-gray-900/95 via-black/95 to-black/95 text-gray-200 shadow-2xl border border-white/5 border-l-transparent`}
    >
      {/* Middle navigation */}
      <nav className="flex-1 px-2 pt-6 pb-4">
        <div className="flex h-full flex-col items-stretch gap-2">
          {navItems.map((item) => {
            const isActive =
              item.path !== '/student/dashboard'
                ? location.pathname.startsWith(item.path)
                : location.pathname === item.path;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.path)}
                className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/8 text-purple-100 outline outline-1 outline-purple-500/60'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-purple-200 shadow-sm shadow-black/40 group-hover:bg-white/10 ${
                    isActive ? 'bg-purple-500/30 text-purple-50' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom account area */}
      <div className="px-3 pb-4 pt-3">
        <button
          type="button"
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors mb-2 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-gray-300">
            <Cog6ToothIcon className="h-5 w-5" />
          </span>
          {!isCollapsed && <span>Account settings</span>}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-red-300 hover:bg-red-900/40 hover:text-red-100 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-900/50">
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default SidePanel;


