// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } // <<< Import connectAuthEmulator
  from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } // <<< Import connectFirestoreEmulator
  from "firebase/firestore";
// import { getFunctions, connectFunctionsEmulator } from "firebase/functions"; // If you use Functions

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// const functions = getFunctions(app); // If you use Functions

// Connect to Emulators in development
// IMPORTANT: Make sure this block ONLY runs in your local development environment
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  console.warn(
    "APPLICATION IS RUNNING IN DEVELOPMENT MODE: CONNECTING TO FIREBASE EMULATORS. " +
    "Ensure emulators are started with 'firebase emulators:start'."
  );
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    console.log("Auth Emulator connected at http://localhost:9099");

    connectFirestoreEmulator(db, "localhost", 8080); // Hostname and port
    console.log("Firestore Emulator connected at http://localhost:8080");

    // if (functions) { // If you initialized functions
    //   connectFunctionsEmulator(functions, "localhost", 5001);
    //   console.log("Functions Emulator connected at http://localhost:5001");
    // }
  } catch (error) {
    console.error("Error connecting to Firebase emulators:", error);
    alert(
        "Could not connect to Firebase Emulators. Please ensure they are running. " +
        "Check the console for more details. App might not work correctly."
    );
  }
} else {
  console.log("Application is running in production mode (or not on localhost), connecting to live Firebase services.");
}

export { app, auth, db /*, functions */ };