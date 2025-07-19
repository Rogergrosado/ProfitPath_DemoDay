import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

import { getAuth } from "firebase/auth";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const auth = getAuth();
  const user = auth.currentUser;
  
  console.log('🔐 getAuthHeaders - Firebase current user:', user ? 'authenticated' : 'not authenticated');
  
  if (!user) {
    // Fallback to stored user ID for backwards compatibility
    const storedUser = localStorage.getItem('current-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log('🔐 Using stored user ID:', userData.id);
        return { "x-user-id": userData.id.toString() };
      } catch (e) {
        console.warn('Failed to parse stored user data');
      }
    }
    console.warn('🔐 No Firebase user and no stored user - returning empty headers');
    return {};
  }

  try {
    const idToken = await user.getIdToken();
    console.log('🔐 Firebase token obtained, length:', idToken.length);
    return { 
      "Authorization": `Bearer ${idToken}`,
      "x-user-id": "3" // Keep backwards compatibility for now
    };
  } catch (error) {
    console.warn('Failed to get Firebase token:', error);
    return { "x-user-id": "3" }; // Fallback
  }
}

export async function apiRequest(
  url: string,
  options?: {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
    userId?: number;
  }
): Promise<Response> {
  const { method = "GET", body, headers = {} } = options || {};
  
  const authHeaders = await getAuthHeaders();
  console.log('🔐 Making API request to:', url, 'with auth headers:', Object.keys(authHeaders));
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...authHeaders,
      ...headers,
    },
    body,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Use the same authentication headers as apiRequest
    const authHeaders = await getAuthHeaders();
    
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: {
        ...authHeaders,
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable refetch on window focus
      staleTime: 0, // Always refetch to ensure fresh data
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
