// src/components/Pets/CreatePetForm.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createPetListing } from '../../services/petService';
import { useNavigate } from 'react-router-dom';
import './CreatePetForm.css'; // Create this

const CreatePetForm = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Dog'); // Dog, Cat, Bird, etc.
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Simple URL for now
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("You must be logged in to create a listing.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const petData = { name, type, breed, age: parseInt(age), description, imageUrl };
      await createPetListing(petData, currentUser.uid);
      navigate('/pets'); // Or to the newly created pet's detail page
    } catch (err) {
      setError(err.message || 'Failed to create listing. Please try again.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="create-pet-form">
      <h2>Create New Pet Listing</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label htmlFor="petName">Pet's Name:</label>
        <input id="petName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="petType">Type:</label>
        <select id="petType" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Bird">Bird</option>
          <option value="Rabbit">Rabbit</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="petBreed">Breed:</label>
        <input id="petBreed" type="text" value={breed} onChange={(e) => setBreed(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="petAge">Age (years):</label>
        <input id="petAge" type="number" value={age} onChange={(e) => setAge(e.target.value)} required min="0" />
      </div>
      <div className="form-group">
        <label htmlFor="petDescription">Description:</label>
        <textarea id="petDescription" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="petImageUrl">Image URL (optional):</label>
        <input id="petImageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
      </div>
      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Creating...' : 'Create Listing'}
      </button>
    </form>
  );
};

export default CreatePetForm;