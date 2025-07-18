import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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
  const { method = "GET", body, headers = {}, userId } = options || {};
  
  // Get user ID from auth context or storage
  let userIdToSend = userId;
  if (!userIdToSend) {
    // Try to get from localStorage or sessionStorage
    const storedUser = localStorage.getItem('current-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userIdToSend = user.id;
      } catch (e) {
        console.warn('Failed to parse stored user data');
      }
    }
  }
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(userIdToSend ? { "x-user-id": userIdToSend.toString() } : {}),
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
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
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
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
