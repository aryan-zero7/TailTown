// src/pages/FavoritesPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import PetList from '../components/Pets/PetList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { Link } from 'react-router-dom';
import './FavoritesPage.css'; // Create this CSS file

const FavoritesPage = () => {
  const { currentUser, currentUserData, loading: authLoading } = useAuth();
  const [favoritePets, setFavoritePets] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [error, setError] = useState('');

  const fetchFavoritedPets = useCallback(async () => {
    if (!currentUser || !currentUserData) {
      setError("Please log in to view your favorites.");
      setLoadingPage(false);
      setFavoritePets([]);
      return;
    }

    const favoritedIds = Array.isArray(currentUserData.favoritePetIds) ? currentUserData.favoritePetIds : [];

    if (favoritedIds.length === 0) {
      setError("You haven't favorited any pets yet!");
      setFavoritePets([]);
      setLoadingPage(false);
      return;
    }

    setLoadingPage(true);
    setError('');
    try {
      // Firestore 'in' query limit is 30. Batch if necessary.
      const idsToQuery = favoritedIds.length > 30 ? favoritedIds.slice(0, 30) : favoritedIds;
      if (favoritedIds.length > 30) {
        console.warn("Displaying first 30 favorites due to query limits. Implement batching for more.");
      }

      if (idsToQuery.length === 0) { // Should be caught above, but as a safeguard
        setFavoritePets([]);
        setLoadingPage(false);
        return;
      }
      
      const petsRef = collection(db, 'pets');
      const q = query(petsRef, where(documentId(), 'in', idsToQuery));
      
      const querySnapshot = await getDocs(q);
      const petsData = [];
      querySnapshot.forEach((doc) => {
        petsData.push({ id: doc.id, ...doc.data() });
      });
      setFavoritePets(petsData);
    } catch (err) {
      console.error("Error fetching favorited pets:", err);
      setError("Could not load your favorited pets. Please try again.");
    } finally {
      setLoadingPage(false);
    }
  }, [currentUser, currentUserData]); // Depend on these context values

  useEffect(() => {
    if (!authLoading) { // Only fetch once auth state is resolved
      fetchFavoritedPets();
    }
  }, [authLoading, fetchFavoritedPets]); // fetchFavoritedPets is now memoized by useCallback

  if (authLoading || loadingPage) {
    return (
      <div className="page-container favorites-page loading-container">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="page-container favorites-page">
      <h2>My Favorite Pets</h2>
      {error && <p className="error-message" style={{textAlign: 'center'}}>{error}</p>}
      {!error && favoritePets.length === 0 && ( // No error, no pets, not loading
        <p style={{textAlign: 'center'}}>You haven't added any pets to your favorites yet. <Link to="/pets">Browse pets</Link> to find some!</p>
      )}
      {!error && favoritePets.length > 0 && <PetList pets={favoritePets} />}
    </div>
  );
};

export default FavoritesPage;