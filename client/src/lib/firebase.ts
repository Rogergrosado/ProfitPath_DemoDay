import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC9w8AjplHXxv6HBJ_0J1ckB1T4paEsB-k",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "profithpath-demoday"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "profithpath-demoday",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "profithpath-demoday"}.firebasestorage.app`,
  messagingSenderId: "482793563032",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:482793563032:web:124683965e640c27ee41ed",
  measurementId: "G-F4H2E1W683"
};

// Debug: Log config in development
if (import.meta.env.DEV) {
  console.log("Firebase Config Debug:", {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? "✓ Set" : "✗ Missing",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing", 
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? "✓ Set" : "✗ Missing",
    authDomain: firebaseConfig.authDomain
  });
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
};

export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (result.user && displayName) {
    await updateProfile(result.user, { displayName });
  }
  return result;
};

export const handleRedirectResult = () => {
  return getRedirectResult(auth);
};

export const signOutUser = () => {
  return signOut(auth);
};

export { onAuthStateChanged };
