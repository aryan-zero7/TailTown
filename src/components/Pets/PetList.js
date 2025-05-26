// src/components/Pets/PetList.js
import React from 'react';
import PetCard from './PetCard';
import './PetList.css'; // Create this

const PetList = ({ pets }) => {
  if (!pets || pets.length === 0) {
    return <p>No pets found. Try adjusting your search or check back later!</p>;
  }

  return (
    <div className="pet-list">
      {pets.map(pet => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
};

export default PetList;