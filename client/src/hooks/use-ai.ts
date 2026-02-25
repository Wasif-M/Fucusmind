import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getApiUrl } from "@/lib/api-url";
import { useToast } from "@/hooks/use-toast";

interface CheckinData {
  moodScore: number;
  sleepHours: number;
  stressLevel: number;
  notes?: string;
}

interface AISuggestionsResponse {
  dailyTip: string;
  strengths: string[];
  improvements: string[];
  recommendedExercises: Array<{
    name: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

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

export function useAISuggestions() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      checkinData?: CheckinData;
      exerciseHistory?: string[];
    }) => {
      const res = await fetch(getApiUrl("/api/ai/suggestions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      
      // Check if response has the required fields (handles fallback data)
      if (!data.dailyTip || !data.strengths || !data.improvements || !data.recommendedExercises) {
        throw new Error(data.details || "Invalid response format from server");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate suggestions");
      }

      return data as AISuggestionsResponse;
    },
    onError: (error) => {
      toast({
        title: "Suggestions Failed",
        description: error instanceof Error ? error.message : "Could not generate suggestions",
        variant: "destructive",
      });
    },
  });
}
