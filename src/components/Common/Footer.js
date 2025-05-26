// src/components/Common/Footer.js
import React from 'react';
import './Footer.css'; // Create this

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} TailTown. All rights reserved.</p>
      <p>Find your furry friend today!</p>
    </footer>
  );
};

export default Footer;