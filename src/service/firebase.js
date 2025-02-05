import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { getDatabase, ref, onChildAdded, onChildChanged } from "firebase/database";
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
const storage = getStorage(app); // Firebase Storage

// ==================== Service Layer Functions ====================

// Users Collection
export const addUser = async (userId, userData) => {
  const userRef = doc(db, 'Users', userId);
  await setDoc(userRef, userData);
};

export const getUser = async (userId) => {
  const userRef = doc(db, 'Users', userId);
  const userDoc = await getDoc(userRef);
  return userDoc.exists() ? userDoc.data() : null;
};

export const updateUser = async (userId, updatedData) => {
  const userRef = doc(db, 'Users', userId);
  await updateDoc(userRef, updatedData);
};

export const deleteUser = async (userId) => {
  const userRef = doc(db, 'Users', userId);
  await deleteDoc(userRef);
};

// Bookings Collection
export const addBooking = async (bookingId, bookingData) => {
  const bookingRef = doc(db, 'Bookings', bookingId);
  await setDoc(bookingRef, bookingData);
};

export const getBooking = async (bookingId) => {
  const bookingRef = doc(db, 'Bookings', bookingId);
  const bookingDoc = await getDoc(bookingRef);
  return bookingDoc.exists() ? bookingDoc.data() : null;
};

export const getBookingsByUser = async (userId) => {
  const bookingsRef = collection(db, 'Bookings');
  const q = query(bookingsRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};

export const updateBooking = async (bookingId, updatedData) => {
  const bookingRef = doc(db, 'Bookings', bookingId);
  await updateDoc(bookingRef, updatedData);
};

export const deleteBooking = async (bookingId) => {
  const bookingRef = doc(db, 'Bookings', bookingId);
  await deleteDoc(bookingRef);
};

// Car Status Collection
export const addCarStatus = async (carId, carData) => {
  const carRef = doc(db, 'CarStatus', carId);
  await setDoc(carRef, carData);
};

export const getCarStatus = async (carId) => {
  const carRef = doc(db, 'CarStatus', carId);
  const carDoc = await getDoc(carRef);
  return carDoc.exists() ? carDoc.data() : null;
};

export const updateCarStatus = async (carId, updatedData) => {
  const carRef = doc(db, 'CarStatus', carId);
  await updateDoc(carRef, updatedData);
};

// Review Rating Collection
export const addReview = async (reviewId, reviewData) => {
  const reviewRef = doc(db, 'ReviewRating', reviewId);
  await setDoc(reviewRef, reviewData);
};

export const getReviewsByBooking = async (bookingId) => {
  const reviewsRef = collection(db, 'ReviewRating');
  const q = query(reviewsRef, where('bookingID', '==', bookingId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};

// Trip KM Collection
export const addTripKM = async (kmId, tripData) => {
  const tripRef = doc(db, 'TripKM', kmId);
  await setDoc(tripRef, tripData);
};

export const getTripKMByBooking = async (bookingId) => {
  const tripsRef = collection(db, 'TripKM');
  const q = query(tripsRef, where('bookingID', '==', bookingId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
};

// Export Firebase instances and utility functions
export {
  auth,
  storage,
  db,
  database,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  doc,
  getDoc,
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