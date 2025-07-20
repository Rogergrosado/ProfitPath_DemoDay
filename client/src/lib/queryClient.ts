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
  const currentUser = auth.currentUser;
  
  console.log('🔐 getAuthHeaders - Firebase current user:', currentUser ? 'authenticated' : 'not authenticated');
  
  if (!currentUser) {
    throw new Error("User not authenticated - Firebase user required");
  }

  try {
    // Force token refresh to ensure we have the latest token
    const token = await currentUser.getIdToken(true);
    console.log('🔐 Fresh Firebase token obtained, length:', token.length);
    
    return {
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.error('🔐 Failed to get fresh Firebase token:', error);
    throw new Error("Failed to get fresh authentication token");
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
    try {
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
    } catch (error) {
      // If authentication fails, handle gracefully
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
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
