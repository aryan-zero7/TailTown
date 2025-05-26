// src/components/Auth/SignUpForm.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import { registerUser } from '../../services/authService';
// import { useAuth } from '../../contexts/AuthContext'; // Not strictly needed here for auto-login
import './AuthForm.css';

const SignUpForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Buyer'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { setCurrentUser, setCurrentUserData } = useAuth(); // We don't need to manually set context here, onAuthStateChanged does it

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // The registerUser function now handles creating the user and storing their data.
      // Firebase's onAuthStateChanged listener (in AuthContext) will automatically
      // update the currentUser state across the app.
      await registerUser(email, password, name, role);

      // Navigate to the dashboard (or desired page) after successful registration.
      // The AuthContext will already have the new user by the time the dashboard loads.
      navigate('/dashboard');
    } catch (err) {
      // Handle specific Firebase errors if needed
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use. Please use a different email or login.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password is too weak. Please choose a stronger password.');
      } else {
        setError(err.message || 'Failed to create an account. Please try again.');
      }
      console.error("Signup error:", err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Sign Up for TailTown</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label htmlFor="name">Full Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password (min. 6 characters):</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength="6"
        />
      </div>
      <div className="form-group">
        <label htmlFor="role">Register as:</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Buyer">Buyer</option>
          <option value="Seller">Seller</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Creating Account...' : 'Sign Up & Continue'}
      </button>
      <p className="form-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
};

export default SignUpForm;