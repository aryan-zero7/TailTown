// src/App.js
import React from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer'; // You can create a simple footer
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import PetSearchPage from './pages/PetSearchPage';
import PetDetailPage from './pages/PetDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import ChatListPage from './pages/ChatListPage';

import './App.css'; // Global styles

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              
              {/* Public pet routes */}
              <Route path="/pets" element={<PetSearchPage />} />
              <Route path="/pets/:petId" element={<PetDetailPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }/>
              <Route path="/create-listing" element={
                <ProtectedRoute allowedRoles={['Seller', 'Admin']}>
                  <CreateListingPage />
                </ProtectedRoute>
              }/>
              {/* Add more protected routes as needed */}

              {/* Catch-all for 404 Not Found - simple version */}
              <Route path="*" element={
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <h2>404 - Page Not Found</h2>
                  <p>Sorry, the page you are looking for does not exist.</p>
                  <Link to="/">Go to Homepage</Link>
                </div>
              } />

              <Route path="/chats" element={
                <ProtectedRoute>
                  <ChatListPage />
                </ProtectedRoute>
              }/>

            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;