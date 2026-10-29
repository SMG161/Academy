import { useState } from 'react';
import Header from '../components/LandingPage/Header';
import Footer from '../components/LandingPage/Footer';
import Hero from '../components/LandingPage/Hero';
import SignInPopup from '../components/LandingPage/SignInPopup';
import SignUpPopup from '../components/LandingPage/SignUpPopup';

const Landing = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <Header 
        onSignInClick={() => setIsSignInOpen(true)}
        onSignUpClick={() => setIsSignUpOpen(true)}
      />
      <Hero onEnrollNowClick={() => setIsSignUpOpen(true)} />
      <Footer
        onSignInClick={() => setIsSignInOpen(true)}
        onSignUpClick={() => setIsSignUpOpen(true)}
      />
      <SignInPopup 
        isOpen={isSignInOpen} 
        onClose={() => setIsSignInOpen(false)} 
      />
      <SignUpPopup 
        isOpen={isSignUpOpen} 
        onClose={() => setIsSignUpOpen(false)} 
      />
    </div>
  );
};

export default Landing;
