import { useState } from 'react';
import StudentHeader from '../StudentHeader';
import SidePanel from '../SidePanel';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      {/* Fixed Header */}
      <StudentHeader onToggle={() => setIsCollapsed((prev) => !prev)} />

      {/* Fixed Sidebar */}
      <SidePanel isCollapsed={isCollapsed} />

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
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

export default StudentLayout;