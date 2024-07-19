import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <div>
          <Link to="/" className="text-white">Home</Link>
        </div>
        <div>
          <button onClick={logout} className="text-white">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
