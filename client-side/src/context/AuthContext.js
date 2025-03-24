import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('user')) || null;
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Google Sign-in (Only SRM Emails Allowed)
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      console.log('User Credential:', userCredential); // Debugging log
  
      if (!userCredential || !userCredential.user) {
        throw new Error('User information is not available.');
      }
  
      const loggedInUser = userCredential.user;
      
      console.log('Logged-in User:', loggedInUser); // Debugging log
  
      // Ensure user has a valid email and is from SRM
      if (!loggedInUser.email || !loggedInUser.email.toLowerCase().endsWith('@srmist.edu.in')) {
        await signOut(auth);
        alert('Only SRM emails (@srmist.edu.in) are allowed.');
        return null;
      }
  
      setUser(loggedInUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(loggedInUser));
      }
  
      return loggedInUser;
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw error;
    }
  };
  
  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  // Track user auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email.toLowerCase().endsWith('@srmist.edu.in')) {
        setUser(currentUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, logout: handleLogout, loading }}>
      {!loading && children} {/* Render children only when not loading */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
