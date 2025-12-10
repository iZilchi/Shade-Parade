import React from 'react';

const Header = ({ isAuthPage = false }) => {
  return (
    <header className={`header ${isAuthPage ? 'auth-header' : ''}`}>
      <div className="header-content">
        <h1 className="header-title">Shade Parade</h1>
        <p className="header-subtitle">Color Palette Manager with Sorting Algorithms</p>
        {!isAuthPage && (
          <div className="header-badge">
            <span className="badge badge-success">Live</span>
            <span className="text-sm ml-2">AI-powered color tools</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;