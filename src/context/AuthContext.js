import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../service/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // Added userRole state
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await fetchUserRole(user.email); // Fetch role using UID
        setCurrentUser(user);
        setUserRole(role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);  // Stop loading once auth is verified
    });

    return unsubscribe;
  }, []);

  // Function to fetch user role from Firestore using UID
  const fetchUserRole = async (email) => {
    try {
      const userDocRef = doc(db, "users", email);  // Using UID instead of email
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const { role } = userDoc.data();
        if (!role) throw new Error("User role not defined in Firestore");
        return role;
      } else {
        throw new Error("User document not found");
      }
    } catch (error) {
      console.error("Error fetching user role:", error.message);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole }}>
      {!loading ? children : <LoadingScreen />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Loading Screen while verifying auth state
function LoadingScreen() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h3>Loading...</h3>
    </div>
  );
}
