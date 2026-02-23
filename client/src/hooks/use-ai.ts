import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getApiUrl } from "@/lib/api-url";
import { useToast } from "@/hooks/use-toast";

export function useAnalyzeCheckin() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (checkinId: number) => {
      const res = await fetch(getApiUrl(api.ai.analyze.path), {
        method: api.ai.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkinId }),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Check-in not found");
        }
        throw new Error("Failed to generate analysis");
      }
      return api.ai.analyze.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
