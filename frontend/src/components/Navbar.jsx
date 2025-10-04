import React from 'react';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>ExpensePro</h2>
      </div>
      <div className="navbar-user">
        <span>Welcome, {user?.name}! <span className="user-role">({user?.role})</span></span>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;