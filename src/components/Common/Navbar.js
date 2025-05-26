// src/components/Common/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logoutUser } from '../../services/authService';
// import logoImage from '../../assets/logo.png'; // Uncomment if you have a logo image

import './Navbar.css';

const Navbar = () => {
  const { currentUser, currentUserData } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null); // Ref for the mobile menu container

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsMobileMenuOpen(false); // Close menu on logout
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out:", error);
      // Optionally show an error message to the user
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when a link is clicked or on navigating
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the mobile menu and not on the toggle button itself
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('.menu-toggle') // Check if the click was on the toggle or its children
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);


  // Helper to render NavLink with active class logic
  const renderNavLink = (to, text, isButton = false) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${isButton ? 'navbar-button' : ''} ${isActive ? 'active' : ''}`
      }
      onClick={closeMobileMenu}
    >
      {text}
    </NavLink>
  );


  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={closeMobileMenu} className="navbar-brand-link">
          {/* Uncomment and use if you have a logo */}
          {/* <img src={logoImage} alt="TailTown Logo" className="navbar-logo" /> */}
          TailTown
        </Link>
      </div>

      {/* Hamburger Menu Toggle Button */}
      <button
        className={`menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation Links Container (for desktop and mobile dropdown) */}
      <div
        ref={mobileMenuRef}
        className={`navbar-links-container ${isMobileMenuOpen ? 'open' : ''}`}
      >
        <ul className="navbar-links">
          <li>{renderNavLink("/pets", "Search Pets")}</li>

          {currentUser && (
            <>
              {(currentUserData?.role === 'Seller' || currentUserData?.role === 'Admin') && (
                <li>{renderNavLink("/create-listing", "Create Listing")}</li>
              )}
              <li>{renderNavLink("/dashboard", "Dashboard")}</li>
              <li>{renderNavLink("/chats", "My Chats")}</li>
            </>
          )}
        </ul>

        {/* Auth links and user info - part of the same container for mobile layout */}
        <div className="user-info">
          {currentUser ? (
            <>
              <span className="user-greeting">
                Hi, {currentUserData?.name?.split(' ')[0] || currentUser.email.split('@')[0]}!
              </span>
              <button onClick={handleLogout} className="navbar-button logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login is a link styled like other nav items, Sign Up is a button */}
              <ul className="navbar-links"> {/* Wrap in UL for consistent mobile styling */}
                <li>{renderNavLink("/login", "Login")}</li>
                <li>{renderNavLink("/signup", "Sign Up", true)}</li> {/* true for isButton */}
              </ul>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;