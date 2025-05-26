// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null); // To store user role, etc.
  const [loading, setLoading] = useState(true);

  // src/contexts/AuthContext.js
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => { // <--- THIS IS KEY
    setCurrentUser(user); // Sets the user from Firebase Auth
    if (user) {
      // Fetch additional user data (like role) from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setCurrentUserData({ uid: user.uid, ...userDocSnap.data() });
      } else {
        console.warn("User document not found immediately after signup for UID:", user.uid, "This might be a timing issue or the document wasn't created.");
        // Potentially try to fetch again after a short delay or handle this scenario
        setCurrentUserData(null);
      }
    } else {
      setCurrentUserData(null);
    }
    setLoading(false);
  });
  return unsubscribe;
}, []);

  const value = {
    currentUser,
    currentUserData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}