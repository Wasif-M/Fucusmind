import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SavedResponse {
  id: number;
  userId: string;
  messageContent: string;
  conversationId: number | null;
  createdAt: string;
}

export function useSavedResponses() {
  const queryClient = useQueryClient();

  const { data: savedResponses = [], isLoading } = useQuery<SavedResponse[]>({
    queryKey: ["/api/saved-responses"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/saved-responses");
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ content, conversationId }: { content: string; conversationId?: number }) => {
      const res = await apiRequest("POST", "/api/saved-responses", { content, conversationId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-responses"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/saved-responses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-responses"] });
    },
  });

  const isResponseSaved = (content: string) => 
    savedResponses.some(r => r.messageContent === content);

  return {
    savedResponses,
    isLoading,
    saveResponse: saveMutation.mutate,
    deleteResponse: deleteMutation.mutate,
    isResponseSaved,
    isSaving: saveMutation.isPending,
  };
}
