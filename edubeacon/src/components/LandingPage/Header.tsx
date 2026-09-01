import { Link } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle';

interface HeaderProps {
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

const Header = ({ onSignInClick, onSignUpClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm dark:bg-gray-900 dark:shadow-black/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              Education
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              Home
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              About Us
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              Pages
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              Services
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              Course
            </Link>
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:text-purple-400">
              Blog
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-purple-400" />
            <button
              onClick={onSignInClick}
              className="text-gray-700 hover:text-purple-600 transition-colors font-semibold dark:text-gray-200 dark:hover:text-purple-400"
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



