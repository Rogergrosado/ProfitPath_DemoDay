import { getAuth } from 'firebase/auth';

export async function useFirebaseAuthHeaders() {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    // Fallback for backwards compatibility
    return {
      headers: {
        'x-user-id': '3'
      }
    };
  }

  try {
    const idToken = await user.getIdToken();
    return {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'x-user-id': '3' // Keep for backwards compatibility
      }
    };
  } catch (error) {
    console.warn('Failed to get Firebase auth token:', error);
    return {
      headers: {
        'x-user-id': '3'
      }
    };
  }
}