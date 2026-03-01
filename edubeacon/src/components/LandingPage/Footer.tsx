import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-purple-400 mb-4">Education</h3>
            <p className="text-gray-400">
              Empowering learners worldwide with quality education and innovative learning solutions.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-yellow-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/signin" className="hover:text-yellow-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-yellow-400 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/" className="hover:text-yellow-400 transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-yellow-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-yellow-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-yellow-400">Contact</h4>
            <p className="text-gray-400 mb-2">Email: info@edubeacon.com</p>
            <p className="text-gray-400">Phone: +1 (555) 123-4567</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2024 EduBeacon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



