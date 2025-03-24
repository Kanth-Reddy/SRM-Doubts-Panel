// Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD4dJcQ4lb7c6EghpPMGL4N_dAq8JzRK_E",
  authDomain: "srm-doubts-panel.firebaseapp.com",
  projectId: "srm-doubts-panel",
  storageBucket: "srm-doubts-panel.appspot.com",
  messagingSenderId: "153576714654",
  appId: "1:153576714654:web:c80ed6c72ce39e1bb2268f",
  measurementId: "G-C7PPNBM3Y1"
};

// Initialize Firebase only once
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

// Google sign-in function with SRM mail restriction
const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    if (email.endsWith("@srmist.edu.in")) {
      console.log("SRM Email Verified ✅");
      return result.user;
    } else {
      await signOut(auth); // Sign out the user if not SRM mail
      throw new Error("Access Denied! Only SRM Emails are allowed.");
    }
  } catch (err) {
    console.error("Error during Google sign-in:", err);
    throw err; // Re-throw the error to handle it in the component
  }
};

export { auth, app, db, signInWithGoogle };