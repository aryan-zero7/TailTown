// src/services/favoritesService.js
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const USERS_COLLECTION = 'users';

export const addPetToFavorites = async (userId, petId) => {
  if (!userId || !petId) {
    console.error("addPetToFavorites: Missing userId or petId");
    throw new Error("User ID and Pet ID are required.");
  }
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  try {
    // Atomically adds petId to the array if it's not already present.
    // Security rules will ensure user can only update their own document.
    await updateDoc(userDocRef, {
      favoritePetIds: arrayUnion(petId)
    });
    console.log(`Pet ${petId} added to favorites for user ${userId}`);
  } catch (error) {
    console.error("Error adding pet to favorites in service:", error);
    throw new Error(`Failed to add to favorites: ${error.message}`);
  }
};

export const removePetFromFavorites = async (userId, petId) => {
  if (!userId || !petId) {
    console.error("removePetFromFavorites: Missing userId or petId");
    throw new Error("User ID and Pet ID are required.");
  }
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  try {
    // Atomically removes all instances of petId from the array.
    await updateDoc(userDocRef, {
      favoritePetIds: arrayRemove(petId)
    });
    console.log(`Pet ${petId} removed from favorites for user ${userId}`);
  } catch (error) {
    console.error("Error removing pet from favorites in service:", error);
    throw new Error(`Failed to remove from favorites: ${error.message}`);
  }
};

// This function is mostly for completeness or if needed outside AuthContext.
// AuthContext.currentUserData should be the primary source for favoritePetIds.
export const getUserDocument = async (userId) => {
  if (!userId) {
    console.warn("getUserDocument: No userId provided");
    return null;
  }
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such user document for ID:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user document in service:", error);
    throw error; // Re-throw for component to handle
  }
};