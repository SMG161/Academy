import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

const LegalLayout = ({ title, lastUpdated, children }: LegalLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header onSignInClick={() => navigate('/')} onSignUpClick={() => navigate('/')} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated: {lastUpdated}</p>

          <div className="space-y-8">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
