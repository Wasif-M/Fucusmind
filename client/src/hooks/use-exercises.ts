import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type ExerciseCompletion, type ExerciseType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useExerciseCompletions() {
  return useQuery({
    queryKey: [api.exercises.list.path],
    queryFn: async () => {
      const res = await fetch(api.exercises.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch exercises");
      return res.json() as Promise<ExerciseCompletion[]>;
    },
  });
}

export function useCompleteExercise() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (exerciseType: string) => {
      const res = await fetch(api.exercises.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseType }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to record exercise");
      return res.json() as Promise<ExerciseCompletion>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.exercises.list.path] });
      toast({
        title: "Exercise Complete",
        description: "Great work! Your progress has been recorded.",
      });
    },
  });
}

export function useResetTodayExercises() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const tzOffset = new Date().getTimezoneOffset();
      const res = await fetch(`${api.exercises.resetToday.path}?tzOffset=${tzOffset}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reset exercises");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.exercises.list.path] });
      toast({
        title: "Exercises Reset",
        description: "All exercises are unlocked. You can start fresh!",
      });
    },
  });
}
