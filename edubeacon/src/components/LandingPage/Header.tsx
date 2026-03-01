import { Link } from 'react-router-dom';

interface HeaderProps {
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

const Header = ({ onSignInClick, onSignUpClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-purple-600">
              Education
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              Home
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              About Us
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              Pages
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              Services
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              Course
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              Blog
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={onSignInClick}
              className="text-gray-700 hover:text-purple-600 transition-colors font-semibold"
            >
              Sign In
            </button>
            <button
              onClick={onSignUpClick}
              className="bg-purple-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-purple-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;



