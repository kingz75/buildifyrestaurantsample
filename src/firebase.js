import { initializeApp } from "firebase/app";
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

// Log config for debugging
console.log("Firebase config:", firebaseConfig);

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log("Firebase database initialized:", database);

export { database };
