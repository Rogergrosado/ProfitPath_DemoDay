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
  
  if (!user) {
    // Fallback to stored user ID for backwards compatibility
    const storedUser = localStorage.getItem('current-user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return { "x-user-id": userData.id.toString() };
      } catch (e) {
        console.warn('Failed to parse stored user data');
      }
    }
    return {};
  }

  try {
    const idToken = await user.getIdToken();
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
    // Get user ID for authentication
    let userIdToSend;
    const storedUser = localStorage.getItem('current-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userIdToSend = user.id;
      } catch (e) {
        console.warn('Failed to parse stored user data');
      }
    }
    
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: {
        ...(userIdToSend ? { "x-user-id": userIdToSend.toString() } : {}),
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
