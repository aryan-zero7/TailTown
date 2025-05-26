// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export const registerUser = async (email, password, name, role) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // This user object represents the authenticated user

    // Update Firebase Auth profile (optional, but good for display name)
    await updateProfile(user, { displayName: name });

    // Store additional user info (like role) in Firestore
    const userData = {
      uid: user.uid,
      name: name,
      email: user.email,
      role: role, // 'Buyer', 'Seller', 'Admin'
      createdAt: new Date()
    };
    await setDoc(doc(db, "users", user.uid), userData);

    // By this point, Firebase Auth state has changed, and onAuthStateChanged in AuthContext
    // will pick up the new user.
    // We return the user and userData for potential use in the component, though not strictly needed for auto-login.
    return { user, userData };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// loginUser and logoutUser remain the same
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return { user, userData: { uid: user.uid, ...userDocSnap.data() } };
    } else {
      console.error("User data not found in Firestore after login");
      return { user, userData: { uid: user.uid, email: user.email } };
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};