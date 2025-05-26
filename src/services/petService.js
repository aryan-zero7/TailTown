// src/services/petService.js
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    Timestamp
  } from 'firebase/firestore';
  import { db } from '../firebase/firebaseConfig';
  
  const PETS_COLLECTION = 'pets';
  
  // Create Listing
  export const createPetListing = async (petData, sellerId) => {
    try {
      const docRef = await addDoc(collection(db, PETS_COLLECTION), {
        ...petData, // { type, breed, age, description, name, imageUrl }
        sellerId: sellerId,
        createdAt: Timestamp.fromDate(new Date()),
        status: 'available' // e.g., available, adopted
      });
      return { id: docRef.id, ...petData, sellerId };
    } catch (error) {
      console.error("Error creating pet listing:", error);
      throw error;
    }
  };
  
  // Browse/Search Listings
  export const getPetListings = async (searchParams = {}) => {
    try {
      let q = query(collection(db, PETS_COLLECTION), orderBy('createdAt', 'desc'));
  
      // Example simple search (can be expanded)
      if (searchParams.type) {
        q = query(q, where('type', '==', searchParams.type));
      }
      if (searchParams.breed) {
        q = query(q, where('breed', '==', searchParams.breed)); // Case-sensitive, exact match
      }
      // For more complex text search, consider Algolia or Typesense with Firebase,
      // or simpler client-side filtering after fetching a broader set.
  
      const querySnapshot = await getDocs(q);
      const pets = [];
      querySnapshot.forEach((doc) => {
        pets.push({ id: doc.id, ...doc.data() });
      });
      return pets;
    } catch (error) {
      console.error("Error fetching pet listings:", error);
      throw error;
    }
  };
  
  // View Pet Details
  export const getPetListingDetails = async (petId) => {
    try {
      const docRef = doc(db, PETS_COLLECTION, petId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log("No such pet document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching pet details:", error);
      throw error;
    }
  };
  
  // (Optional: Update/Delete listing functions can be added later)