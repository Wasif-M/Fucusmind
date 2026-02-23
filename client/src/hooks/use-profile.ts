import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, InsertUserProfile } from "@shared/schema";
import { getApiUrl } from "@/lib/api-url";

async function fetchProfile(): Promise<UserProfile | null> {
  const response = await fetch(getApiUrl("/api/profile"), {
    credentials: "include",
  });

  if (response.status === 401 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function updateProfile(data: Partial<InsertUserProfile>): Promise<UserProfile> {
  const response = await fetch(getApiUrl("/api/profile"), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }

  return response.json();
}

export function useProfile() {
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading } = useQuery<UserProfile | null>({
    queryKey: ["/api/profile"],
    queryFn: fetchProfile,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/profile"], data);
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: updateMutation.mutate,
    updateProfileAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
