import React from 'react';
import './navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">LogiSync</div>
      <ul className="nav-links">
        <li>Calendário</li>
        <li>Agendamentos</li>
        <li>Veículos</li>
        <li>Transportadora</li>
        <li>Sair</li>
      </ul>
      <div className="user-profile">
        <span>Marcelo Tizo</span>
        <img src="/path/to/profile-pic.png" alt="User Profile" className="profile-pic"/>
      </div>
    </nav>
  );
};

export default Navbar;
