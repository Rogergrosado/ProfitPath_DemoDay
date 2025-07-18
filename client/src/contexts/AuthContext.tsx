import { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth, signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, handleRedirectResult, onAuthStateChanged } from "@/lib/firebase";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
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
      
      if (firebaseUser) {
        // Check if user exists in our database
        try {
          const response = await fetch(`/api/users/firebase/${firebaseUser.uid}`);
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            // Store user data for API requests
            localStorage.setItem('current-user', JSON.stringify(userData));
          } else if (response.status === 404) {
            // Create new user
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
              setUser(userData);
              // Store user data for API requests
              localStorage.setItem('current-user', JSON.stringify(userData));
            } else {
              console.error("Failed to create user in database");
            }
          } else {
            console.error("Failed to fetch user from database:", response.status);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        // Clear stored user data
        localStorage.removeItem('current-user');
      }
      
      setLoading(false);
    });

    return unsubscribe;
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
      await signUpWithEmail(email, password, displayName);
      // The onAuthStateChanged listener will handle the rest
    } catch (error: any) {
      throw new Error(error.message || "Sign up failed");
    }
  };

  const logout = async () => {
    await signOutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
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
