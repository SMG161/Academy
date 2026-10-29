import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface PublicPageLayoutProps {
  children: ReactNode;
}

// Chrome for logged-out-reachable pages beyond the landing page itself
// (e.g. the public Courses browser). Sign in/up just send the visitor
// home, where the actual popups live.
const PublicPageLayout = ({ children }: PublicPageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header onSignInClick={() => navigate('/')} onSignUpClick={() => navigate('/')} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer onSignInClick={() => navigate('/')} onSignUpClick={() => navigate('/')} />
    </div>
  );
};

export default PublicPageLayout;
