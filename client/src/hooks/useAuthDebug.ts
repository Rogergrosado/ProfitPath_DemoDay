import { useEffect } from "react";
import { getAuth } from "firebase/auth";

/**
 * Debug hook to catch unexpected UID mismatches
 * Helps identify race conditions between Firebase token and cached data
 */
export const useAuthDebug = () => {
  useEffect(() => {
    const checkUIDMismatch = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        try {
          const token = await user.getIdToken();
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          console.log("🔍 Firebase UID (from token):", decodedToken.user_id);
          
          // Check cached UID
          const cached = localStorage.getItem("current-user");
          if (cached) {
            try {
              const cachedUser = JSON.parse(cached);
              console.log("🔍 Cached UID (localStorage):", cachedUser.firebaseUid);
              
              if (decodedToken.user_id !== cachedUser.firebaseUid) {
                console.warn("⚠️ UID MISMATCH DETECTED!", {
                  firebaseUID: decodedToken.user_id,
                  cachedUID: cachedUser.firebaseUid
                });
              } else {
                console.log("✅ UIDs match - no race condition");
              }
            } catch (e) {
              console.warn("Failed to parse cached user data");
            }
          }
        } catch (error) {
          console.error("Failed to decode Firebase token:", error);
        }
      } else {
        console.log("🔍 No Firebase user - skipping UID check");
      }
    };

    checkUIDMismatch();
  }, []);
};