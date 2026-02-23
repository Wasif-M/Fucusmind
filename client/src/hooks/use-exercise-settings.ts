import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ExerciseSettings {
  breathingDuration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  hapticEnabled: boolean;
}

interface ExerciseFavorite {
  id: number;
  exerciseType: string;
  createdAt: string;
}

interface ExerciseSession {
  id: number;
  exerciseType: string;
  durationSeconds: number;
  completedAt: string;
}

export function useExerciseSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<ExerciseSettings>({
    queryKey: ["/api/exercise-settings"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/exercise-settings");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ExerciseSettings>) => {
      const res = await apiRequest("PATCH", "/api/exercise-settings", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/exercise-settings"], data);
    },
  });

  return {
    settings: settings || { breathingDuration: 4, difficulty: "beginner" as const, hapticEnabled: true },
    isLoading,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useExerciseFavorites() {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<ExerciseFavorite[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/favorites");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (exerciseType: string) => {
      const res = await apiRequest("POST", "/api/favorites", { exerciseType });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (exerciseType: string) => {
      await apiRequest("DELETE", `/api/favorites/${exerciseType}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const isFavorite = (exerciseType: string) => 
    favorites.some(f => f.exerciseType === exerciseType);

  const toggleFavorite = (exerciseType: string) => {
    if (isFavorite(exerciseType)) {
      removeMutation.mutate(exerciseType);
    } else {
      addMutation.mutate(exerciseType);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    isToggling: addMutation.isPending || removeMutation.isPending,
  };
}

export function useExerciseSessions() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery<ExerciseSession[]>({
    queryKey: ["/api/exercise-sessions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/exercise-sessions");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { exerciseType: string; durationSeconds: number }) => {
      const res = await apiRequest("POST", "/api/exercise-sessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercise-sessions"] });
    },
  });

  const getTotalDuration = (exerciseType?: string) => {
    const filtered = exerciseType 
      ? sessions.filter(s => s.exerciseType === exerciseType)
      : sessions;
    return filtered.reduce((sum, s) => sum + s.durationSeconds, 0);
  };

  return {
    sessions,
    isLoading,
    recordSession: createMutation.mutate,
    getTotalDuration,
  };
}
