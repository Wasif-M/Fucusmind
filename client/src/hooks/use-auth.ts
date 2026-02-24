import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
import { getApiUrl } from "@/lib/api-url";

async function fetchUser(): Promise<User | null> {
  const response = await fetch(getApiUrl("/api/auth/user"), {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function logout(): Promise<void> {
  console.log("[Auth] Logging out...");
  const url = getApiUrl("/api/auth/logout");
  console.log("[Auth] Logout endpoint:", url);
  
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  console.log("[Auth] Logout response status:", response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Auth] Logout failed:", response.status, errorText);
    throw new Error(`Logout failed: ${response.status}`);
  }
  
  console.log("[Auth] Logout successful");
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Logout error:", error);
      // Still clear local data even if logout fails
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
