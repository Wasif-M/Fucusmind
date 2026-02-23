import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertCheckin, type Checkin } from "@shared/schema";
import { getApiUrl } from "@/lib/api-url";
import { useToast } from "@/hooks/use-toast";

export function useCheckins() {
  return useQuery({
    queryKey: [api.checkins.list.path],
    queryFn: async () => {
      const res = await fetch(getApiUrl(api.checkins.list.path), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch checkins");
      return api.checkins.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCheckin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCheckin & { forDate?: string }) => {
      const { forDate, ...checkinData } = data;
      const validated = api.checkins.create.input.parse(checkinData);
      const res = await fetch(getApiUrl(api.checkins.create.path), {
        method: api.checkins.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validated, forDate }),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.checkins.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit check-in");
      }
      return api.checkins.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.checkins.list.path], refetchType: 'all' });
      toast({
        title: "Check-in Complete",
        description: "Your wellness data has been recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
