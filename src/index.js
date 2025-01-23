import React from 'react';
import ReactDOM from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App';
import { setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "./service/firebase";  // Adjust the path if needed
import { Analytics } from "@vercel/analytics/react"
import { AuthProvider } from './context/AuthContext';

// Set Firebase Auth Persistence
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Auth persistence set to session storage.");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Analytics  />
    </AuthProvider>
  </React.StrictMode>
);
