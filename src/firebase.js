import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDcqCvUxoORttdvOBp5uk-iEbHTynNzNRc",
  authDomain: "buildifyresturant.firebaseapp.com",
  projectId: "buildifyresturant",
  storageBucket: "buildifyresturant.firebasestorage.app",
  messagingSenderId: "1099050453745",
  appId: "1:1099050453745:web:e772169923d75c5ab4b750",
  measurementId: "G-D34NFRLK6H",
  databaseURL: "https://buildifyresturant-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get database instance
const database = getDatabase(app);

// Export both
export { app, auth, database };
