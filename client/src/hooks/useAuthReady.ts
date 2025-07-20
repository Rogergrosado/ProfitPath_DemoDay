import { useEffect, useState } from "react";
import { getAuth, User } from "firebase/auth";

/**
 * Hook to ensure Firebase auth is ready and token is fresh
 * This prevents race conditions between user object becoming truthy
 * and Firebase completing token refresh
 */
export const useAuthReady = () => {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (user) {
        try {
          // Force token refresh to ensure fresh credentials
          await user.getIdToken(true);
          console.log("🔐 Auth ready - fresh token obtained");
          setAuthReady(true);
        } catch (error) {
          console.error("🔐 Failed to refresh token:", error);
          setAuthReady(false);
        }
      } else {
        console.log("🔐 Auth ready - user logged out");
        setAuthReady(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return authReady;
};