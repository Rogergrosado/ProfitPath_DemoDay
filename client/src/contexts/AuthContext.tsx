import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, handleRedirectResult, onAuthStateChanged } from "@/lib/firebase";
import { logout as utilLogout, validateSession, clearStaleSession } from "@/utils/authUtils";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  showWelcome: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setShowWelcome: (show: boolean) => void;
  signIn: () => void;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signUpWithEmailPassword: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Handle redirect result on page load
    handleRedirectResult().then(async (result) => {
      if (result?.user) {
        // User signed in via redirect
        console.log("User signed in via redirect:", result.user);
      }
    }).catch((error) => {
      console.error("Error handling redirect:", error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (!firebaseUser) {
        // User logged out - clear all state
        console.log("🚪 User logged out - clearing all state");
        clearStaleSession();
        setUser(null);
        setLoading(false);
        return;
      }

      // Check for UID mismatch (different user login)
      const cachedUID = localStorage.getItem('uid');
      const freshUID = firebaseUser.uid;
      
      console.log('🔍 Auth state changed:', { cachedUID, freshUID, isNewSession: cachedUID !== freshUID });

      if (cachedUID && cachedUID !== freshUID) {
        // Different user - clear old session data
        console.log("🔄 Different user detected - clearing old session");
        clearStaleSession();
        setUser(null);
      }

      // Always fetch fresh data for new sessions or if no cached data
      const cachedUser = localStorage.getItem('current-user');
      const shouldFetchFresh = !cachedUID || cachedUID !== freshUID || !cachedUser;

      if (shouldFetchFresh) {
        console.log("📥 Fetching fresh user data...");
        try {
          const response = await fetch(`/api/users/firebase/${freshUID}`);
          
          if (response.ok) {
            const userData = await response.json();
            
            // Store fresh session data
            localStorage.setItem('uid', freshUID);
            localStorage.setItem('current-user', JSON.stringify(userData));
            
            setUser(userData);
            console.log("✅ Fresh user data loaded:", userData.email);
            
          } else if (response.status === 404) {
            // Create new user
            console.log("👤 Creating new user...");
            const newUserData = {
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL,
              firebaseUid: firebaseUser.uid,
            };
            
            const createResponse = await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newUserData),
            });
            
            if (createResponse.ok) {
              const userData = await createResponse.json();
              
              // Store fresh session data
              localStorage.setItem('uid', freshUID);
              localStorage.setItem('current-user', JSON.stringify(userData));
              
              setUser(userData);
              console.log("✅ New user created:", userData.email);
              setShowWelcome(true);
            } else {
              console.error("Failed to create user in database");
            }
          } else {
            console.error("Failed to fetch user data:", response.status);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Use cached data for same session
        try {
          const userData = JSON.parse(cachedUser!);
          
          // Validate cached data matches current Firebase user
          if (userData.firebaseUid === freshUID) {
            setUser(userData);
            console.log("♻️ Using cached user data:", userData.email);
          } else {
            // Cached data is for different user - fetch fresh
            console.warn("⚠️ Cached UID mismatch - fetching fresh data");
            window.location.reload(); // Force refresh to clear stale state
          }
        } catch (error) {
          console.error("Failed to parse cached user data:", error);
          clearStaleSession();
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = () => {
    signInWithGoogle();
  };

  const signInWithEmailPassword = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password);
      // The onAuthStateChanged listener will handle the rest
    } catch (error: any) {
      throw new Error(error.message || "Sign in failed");
    }
  };

  const signUpWithEmailPassword = async (email: string, password: string, displayName: string) => {
    try {
      const result = await signUpWithEmail(email, password, displayName);
      console.log("Firebase signup successful:", result.user?.uid);
      // The onAuthStateChanged listener will handle the rest
      return result;
    } catch (error: any) {
      console.error("Firebase signup error:", error);
      let errorMessage = "Sign up failed";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please try signing in.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await utilLogout(setUser, true);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser,
      loading,
      showWelcome,
      setUser,
      setShowWelcome,
      signIn,
      signInWithEmailPassword,
      signUpWithEmailPassword,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
