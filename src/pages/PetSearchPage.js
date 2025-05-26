// src/pages/PetSearchPage.js
import React, { useState, useEffect } from 'react';
import PetList from '../components/Pets/PetList';
import { getPetListings } from '../services/petService';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import './PetSearchPage.css'; // Create this

const PetSearchPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // For client-side simple text search
  const [searchType, setSearchType] = useState(''); // For pet type filter
  // Add more filters like breed, age if needed for Firebase querying

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      setError('');
      try {
        // Example: if searchType is set, pass it to the service
        const params = {};
        if (searchType) params.type = searchType;
        // if (searchTerm) params.name_contains = searchTerm; // Firestore doesn't support 'contains' directly for multiple fields easily.
                                                          // For complex search, use Algolia/Typesense or fetch all and filter client-side for smaller datasets.

        const petData = await getPetListings(params);
        setPets(petData);
      } catch (err) {
        setError('Failed to fetch pets. Please try again later.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchPets();
  }, [searchType]); // Re-fetch when searchType changes

  // Client-side filtering (can be combined with Firestore queries)
  const filteredPets = pets.filter(pet =>
    (pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     pet.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (searchType ? pet.type === searchType : true)
  );

  return (
    <div className="page-container pet-search-page">
      <h2>Find Your New Friend</h2>
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by name, breed, description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select 
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
          <option value="Rabbit">Rabbit</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && <PetList pets={filteredPets} />}
    </div>
  );
};

export default PetSearchPage;