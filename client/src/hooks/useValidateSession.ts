import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { validateSession, clearStaleSession } from "@/utils/authUtils";

/**
 * Hook to validate current session and prevent stale user data
 * Use this in protected pages to ensure fresh session state
 */
export const useValidateSession = () => {
  const { user, firebaseUser, loading, setUser } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Skip validation while loading
    if (loading) return;

    console.log('🔍 Session validation check:', { 
      hasUser: !!user, 
      hasFirebaseUser: !!firebaseUser,
      userUid: user?.firebaseUid,
      firebaseUid: firebaseUser?.uid 
    });

    // If no Firebase user, clear everything and redirect
    if (!firebaseUser) {
      if (user) {
        console.warn('⚠️ No Firebase user but AuthContext has user - clearing state');
        clearStaleSession();
        setUser(null);
      }
      setLocation("/auth?invalid=no-firebase-user");
      return;
    }

    // If no user data but Firebase user exists, let AuthContext handle it
    if (!user) {
      console.log('ℹ️ No user data but Firebase user exists - letting AuthContext fetch');
      return;
    }

    // Validate session consistency
    if (!validateSession(firebaseUser)) {
      console.warn('⚠️ Session invalid - UID mismatch detected');
      clearStaleSession();
      setUser(null);
      setLocation("/auth?invalid=uid-mismatch");
      return;
    }

    // Additional validation - check if stored UID matches user data
    const cachedUser = localStorage.getItem('current-user');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        if (parsedUser.firebaseUid !== firebaseUser.uid) {
          console.warn('⚠️ Cached user UID does not match Firebase UID');
          clearStaleSession();
          setUser(null);
          setLocation("/auth?invalid=cached-mismatch");
          return;
        }
      } catch (error) {
        console.warn('⚠️ Failed to parse cached user data');
        clearStaleSession();
        setLocation("/auth?invalid=parse-error");
        return;
      }
    }

    console.log('✅ Session validation passed');
  }, [loading, user, firebaseUser, setUser, setLocation]);

  return {
    isValid: !loading && !!user && !!firebaseUser && validateSession(firebaseUser),
    loading
  };
};

/**
 * Lightweight version for components that just need to ensure user is authenticated
 */
export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔐 Auth required - redirecting to login');
      setLocation("/auth?required=true");
    }
  }, [loading, user, setLocation]);

  return { user, loading, isAuthenticated: !loading && !!user };
};