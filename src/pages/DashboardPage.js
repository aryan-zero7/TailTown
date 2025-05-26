// src/pages/DashboardPage.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/Common/LoadingSpinner'; // Assuming you have this
import './DashboardPage.css'; // Import the new CSS

const DashboardPage = () => {
  const { currentUser, currentUserData, loading } = useAuth(); // Added loading

  if (loading) { // Show loading spinner while auth state is being determined
    return <div className="dashboard-page"><LoadingSpinner /></div>;
  }

  if (!currentUser || !currentUserData) {
    // This case should ideally be handled by ProtectedRoute, but as a fallback:
    return (
      <div className="dashboard-page" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <p>You need to be logged in to view this page.</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  const renderRoleSpecificActions = () => {
    switch (currentUserData.role) {
      case 'Seller':
        return (
          <div className="dashboard-card">
            <h3>Seller Tools</h3>
            <ul>
              <li><Link to="/create-listing" className="action-link create-listing">Create New Pet Listing</Link></li>
              {/* <li><Link to="/my-listings" className="action-link my-listings">View My Listings</Link></li> */}
              {/* Add more seller-specific links here */}
            </ul>
          </div>
        );
      case 'Buyer':
        return (
          <div className="dashboard-card">
            <h3>Buyer Tools</h3>
            <ul>
              <li><Link to="/pets" className="action-link search-pets">Search for Pets</Link></li>
              {/* <li><Link to="/saved-pets" className="action-link">View My Saved Pets</Link></li> */}
              {/* Add more buyer-specific links here */}
            </ul>
          </div>
        );
      case 'Admin':
        return (
          <>
            <div className="dashboard-card">
              <h3>Admin - Content Management</h3>
              <ul>
                <li><Link to="/pets" className="action-link search-pets">Browse/Search All Listings</Link></li>
                <li><Link to="/create-listing" className="action-link create-listing">Create Listing (as Admin)</Link></li>
                {/* <li><Link to="/manage-listings" className="action-link manage-listings">Manage All Pet Listings</Link></li> */}
              </ul>
            </div>
            <div className="dashboard-card">
              <h3>Admin - User Management</h3>
              <ul>
                {/* <li><Link to="/manage-users" className="action-link manage-users">Manage Users</Link></li> */}
                {/* Add more admin-specific links here */}
              </ul>
            </div>
          </>
        );
      default:
        return <p className="no-actions-message">No specific actions available for your role.</p>;
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h2>Welcome to your Dashboard, <span className="welcome-name">{currentUserData.name || currentUser.email}!</span></h2>
        <p>
          Your role: <span className="user-role">{currentUserData.role}</span>
        </p>
      </header>

      <div className="dashboard-grid">
        {renderRoleSpecificActions()}

        {/* A general actions card, can be present for all roles */}
        <div className="dashboard-card general-actions-card">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/pets" className="action-link search-pets">Browse All Available Pets</Link></li>
            <li><Link to="/" className="action-link">Back to Homepage</Link></li>
            {/* You can add a link to edit profile here later */}
            {/* <li><Link to="/profile/edit" className="action-link">Edit My Profile</Link></li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;