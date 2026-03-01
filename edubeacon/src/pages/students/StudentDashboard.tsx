import { useState } from 'react';
import SidePanel from '../../components/Student/SidePanel';

const StudentDashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      {/* Header with brand and collapse toggle */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-b from-gray-900/95 via-black/95 to-black/95 text-gray-100">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 rounded-full bg-white" />
              <span className="block h-0.5 w-4 rounded-full bg-white/80" />
              <span className="block h-0.5 w-4 rounded-full bg-white/60" />
            </span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold text-lg shadow-md shadow-purple-500/40">
              E
            </div>
            <div>
              <p className="text-base font-semibold text-white">EduBeacon</p>
              <p className="text-xs text-gray-400">Student dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <div className="hidden md:block">
          <SidePanel isCollapsed={isCollapsed} />
        </div>

        <main className="flex-1 p-6 md:p-10">
          <section className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome back 👋</h1>
            <p className="text-gray-600">
              This is your student dashboard. We&apos;ll add more features here as we build the
              platform.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Enrolled Courses</h3>
              <p className="text-3xl font-bold text-purple-700">0</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Completed Lessons</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Certificates</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Getting Started</h2>
            <p className="text-gray-600 mb-3">
              Once you sign up for courses, you&apos;ll see your upcoming classes, progress, and
              recommendations here.
            </p>
            <p className="text-gray-600">
              For now, explore the platform and get ready to start learning with EduBeacon.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;


