import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="dark-mode-toggle"
      aria-label="Toggle dark mode"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-lg border-b">
        <div className="container">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Odoo Q&A
            </Link>
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="shadow-lg border-b">
      <div className="container">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="handwritten-title">
            Odoo Q&A
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-700">
              Home
            </Link>
            <Link to="/ask" className="text-gray-700">
              Ask Question
            </Link>
            
            <DarkModeToggle />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700">
                  Welcome, {user?.username || 'User'}!
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="bg-blue-500 text-white px-4 py-2 rounded btn"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-white px-4 py-2 rounded btn"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 