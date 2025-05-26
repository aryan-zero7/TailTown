// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Create this

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="home-hero">
        <h1>Welcome to TailTown!</h1>
        <p>Find your new best friend or list a pet for adoption.</p>
        <div className="home-actions">
          <Link to="/pets" className="btn btn-primary">Search Pets</Link>
          <Link to="/signup" className="btn btn-secondary">Get Started</Link>
        </div>
      </header>
      <section className="home-features">
        <h2>Why TailTown?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <h3>Easy Search</h3>
            <p>Quickly find pets by type, breed, and more.</p>
          </div>
          <div className="feature-item">
            <h3>Verified Sellers</h3>
            <p>Connect with trusted sellers and shelters.</p>
          </div>
          <div className="feature-item">
            <h3>Community Focus</h3>
            <p>Join a community of pet lovers.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;