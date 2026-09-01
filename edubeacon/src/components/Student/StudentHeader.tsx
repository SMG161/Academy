import NotificationBell from './NotificationBell';
import ThemeToggle from '../ThemeToggle';

interface HeaderProps {
    onToggle: () => void;
  }

  const StudentHeader = ({ onToggle }: HeaderProps) => {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-gray-900 text-white border-b border-white/5 shadow-md">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 rounded-full bg-white" />
              <span className="block h-0.5 w-4 rounded-full bg-white/80" />
              <span className="block h-0.5 w-4 rounded-full bg-white/60" />
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 font-bold shadow-md">
              E
            </div>
            <div>
              <p className="text-base font-semibold">EduBeacon</p>
              <p className="text-xs text-gray-400">Student Dashboard</p>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors" />
          <NotificationBell />
        </div>
      </header>
    );
  };

  export default StudentHeader;