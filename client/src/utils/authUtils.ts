import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { User } from "@shared/schema";

/**
 * Comprehensive logout function that clears all authentication state
 */
export const logout = async (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  redirect = true
): Promise<void> => {
  try {
    console.log('🚪 Starting comprehensive logout...');
    
    // 1. Sign out from Firebase
    await signOut(auth);
    
    // 2. Clear all localStorage keys related to user session
    const keysToRemove = [
      'current-user',
      'user',
      'uid', 
      'authToken',
      'firebaseUser',
      'firebase-user',
      'auth-token',
      'user-session',
      'cached-user'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // 3. Clear AuthContext state
    setUser(null);
    
    console.log('✅ Logout complete - all state cleared');
    
    // 4. Redirect if requested
    if (redirect) {
      window.location.href = "/auth?logout=success";
    }
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Force clear localStorage even if Firebase logout fails
    localStorage.clear();
    setUser(null);
    
    if (redirect) {
      window.location.href = "/auth?logout=error";
    }
  }
};

/**
 * Development utility to force-flush all authentication state
 */
export const devLogout = async (
  setUser: React.Dispatch<React.SetStateAction<User | null>>
): Promise<void> => {
  try {
    console.log('🔧 DEV: Force-flushing all auth state...');
    
    // Force sign out from Firebase
    await signOut(auth);
    
    // Clear ALL localStorage (nuclear option for dev)
    localStorage.clear();
    
    // Clear AuthContext
    setUser(null);
    
    // Clear any remaining Firebase state
    if (auth.currentUser) {
      await signOut(auth);
    }
    
    console.log('🔧 DEV: Auth state flushed completely');
    
    // Redirect with debug flag
    window.location.href = "/auth?flushed=true";
  } catch (error) {
    console.error('🔧 DEV: Force flush error:', error);
    localStorage.clear();
    setUser(null);
    window.location.href = "/auth?flushed=error";
  }
};

/**
 * Validates if the current session is valid by comparing Firebase UID with cached UID
 */
export const validateSession = (firebaseUser: any): boolean => {
  if (!firebaseUser) {
    return false;
  }
  
  const cachedUID = localStorage.getItem('uid');
  const firebaseUID = firebaseUser.uid;
  
  console.log('🔍 Session validation:', { cachedUID, firebaseUID });
  
  return cachedUID === firebaseUID;
};

/**
 * Clears stale session data when UIDs don't match
 */
export const clearStaleSession = (): void => {
  console.log('🧹 Clearing stale session data...');
  
  const keysToRemove = [
    'current-user',
    'user', 
    'uid',
    'cached-user'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};