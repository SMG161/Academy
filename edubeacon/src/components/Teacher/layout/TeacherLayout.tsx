import { useState } from 'react';
import TeacherHeader from '../TeacherHeader';
import TeacherSidePanel from '../TeacherSidePanel';

interface TeacherLayoutProps {
  children: React.ReactNode;
}

const TeacherLayout = ({ children }: TeacherLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      {/* Fixed Header */}
      <TeacherHeader onToggle={() => setIsCollapsed((prev) => !prev)} />

      {/* Fixed Sidebar */}
      <TeacherSidePanel isCollapsed={isCollapsed} />

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        <div className="px-6 md:px-10 py-6">
          {/* Render the page-specific children */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;
