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

// Helper function to clean environment variables of extra quotes
const cleanEnvVar = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/^["'](.*)["']$/, '$1');
};

const firebaseConfig = {
  apiKey: cleanEnvVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: `${cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID)}.firebaseapp.com`,
  projectId: cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: `${cleanEnvVar(import.meta.env.VITE_FIREBASE_PROJECT_ID)}.firebasestorage.app`,
  messagingSenderId: "482793563032",
  appId: cleanEnvVar(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: "G-F4H2E1W683"
};

// Debug: Log config in development
if (import.meta.env.DEV) {
  console.log("Firebase Config Debug:", {
    apiKey: firebaseConfig.apiKey ? "✓ Set" : "✗ Missing",
    projectId: firebaseConfig.projectId ? "✓ Set" : "✗ Missing", 
    appId: firebaseConfig.appId ? "✓ Set" : "✗ Missing",
    authDomain: firebaseConfig.authDomain,
    rawValues: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    },
    cleanedValues: {
      apiKey: firebaseConfig.apiKey,
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId
    }
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
