// src/components/Pets/PetCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './PetCard.css'; // Create this

const PetCard = ({ pet }) => {
  const defaultImage = 'https://via.placeholder.com/300x200.png?text=No+Image'; // Placeholder

  return (
    <div className="pet-card">
      <Link to={`/pets/${pet.id}`}>
        <img 
          src={pet.imageUrl || defaultImage} 
          alt={pet.name || 'Pet'} 
          className="pet-card-image" 
          onError={(e) => { e.target.onerror = null; e.target.src=defaultImage; }}
        />
        <div className="pet-card-info">
          <h3>{pet.name}</h3>
          <p>Type: {pet.type}</p>
          <p>Breed: {pet.breed}</p>
          <p>Age: {pet.age} year(s)</p>
        </div>
      </Link>
    </div>
  );
};

export default PetCard;