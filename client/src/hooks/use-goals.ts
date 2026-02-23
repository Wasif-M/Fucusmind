import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UserGoal {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  targetValue: number | null;
  currentValue: number;
  goalType: string;
  targetDate: string | null;
  completed: boolean;
  createdAt: string;
}

interface CreateGoalData {
  title: string;
  description?: string;
  targetValue?: number;
  goalType: string;
  targetDate?: string;
}

export function useGoals() {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery<UserGoal[]>({
    queryKey: ["/api/goals"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateGoalData) => {
      const res = await apiRequest("POST", "/api/goals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<UserGoal>) => {
      const res = await apiRequest("PATCH", `/api/goals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    deleteGoal: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
