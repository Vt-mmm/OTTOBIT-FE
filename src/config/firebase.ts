// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = { 
  apiKey : "AIzaSyA55zEcG49ilkPl5mslapO11zb942rGSu4" , 
  authDomain : "tell-me-cf191.firebaseapp.com" , 
  projectId : "tell-me-cf191" , 
  storageBucket : "tell-me-cf191.firebasestorage.app" , 
  messagingSenderId : "1082365556023" , 
  appId : "1:1082365556023:web:6f4e219acf0c4e330256b2" , 
  measurementId : "G-37HQT668Y4" 
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Function to ensure user is authenticated with Firebase
export const ensureFirebaseAuth = async (): Promise<void> => {
  try {
    // Check if user is already authenticated
    if (auth.currentUser) {
      return;
    }

    // Sign in anonymously with timeout
    const signInPromise = signInAnonymously(auth);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Authentication timeout")), 10000)
    );
    
    await Promise.race([signInPromise, timeoutPromise]);
  } catch (error: any) {
    // Provide specific error messages
    let errorMessage = "Failed to authenticate with Firebase";
    
    switch (error.code) {
      case "auth/operation-not-allowed":
        errorMessage = "Anonymous authentication is not enabled. Please enable it in Firebase Console.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your internet connection.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many authentication requests. Please try again later.";
        break;
      default:
        errorMessage = `Authentication failed: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

export { app, analytics, storage, auth };
