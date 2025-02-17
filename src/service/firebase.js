import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail // Added this for password reset functionality
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  addDoc, 
  getDoc, 
  collection, 
  getDocs,
  setDoc,
  query, 
  where, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore"; // Firestore
import { 
  getDatabase, 
  ref, 
  onChildAdded, 
  onChildChanged 
} from "firebase/database"; // Realtime Database
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase instances
const auth = getAuth(app); // Firebase Auth
const db = getFirestore(app); // Firestore instance
const database = getDatabase(app); // Realtime Database instance
const storage = getStorage(app); // Initialize Firebase Storage

export {
  auth,
  storage,
  db,
  addDoc,
  database,
  signInWithEmailAndPassword,
  sendPasswordResetEmail, // Export this function
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  ref,
  onChildAdded,
  onChildChanged,
};
