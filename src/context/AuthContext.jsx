import { createContext, useContext, useEffect, useState } from 'react';
import { auth, database } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, set } from 'firebase/database';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Realtime Database
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
          // If user doesn't exist in Realtime Database, create them
          const newUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || null,
            emailVerified: firebaseUser.emailVerified,
            role: 'user', // Default role
            createdAt: new Date().toISOString()
          };

          await set(userRef, newUser);
          setUser({ ...firebaseUser, ...newUser });
        } else {
          // If user exists, merge Firebase Auth data with database data
          setUser({ ...firebaseUser, ...snapshot.val() });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 