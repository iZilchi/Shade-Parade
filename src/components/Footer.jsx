import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>About</h3>
            <p>
              Shade Parade helps designers and developers manage color palettes with sorting algorithms.
            </p>
          </div>
          <div className="footer-section">
            <h3>How to Use</h3>
            <ul>
              <li>Use Color Picker or enter hex codes</li>
              <li>Choose sorting algorithm and sort by Lightness or Hue</li>
              <li>Save and download palettes</li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Credits</h3>
            <p>
              Created by Princess Mae Delos Santos, Mara Joy Lontok, Rain Lyrra Panganiban, and Jude Tadeja
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          © 2024 Shade Parade. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;