import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useAnalyzeCheckin } from "@/hooks/use-ai";
import { Checkin } from "@shared/schema";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface AIInsightProps {
  latestCheckin?: Checkin;
}

export function AIInsight({ latestCheckin }: AIInsightProps) {
  const { mutate, isPending, data } = useAnalyzeCheckin();
  const [analyzed, setAnalyzed] = useState(false);

  const handleAnalyze = () => {
    if (latestCheckin) {
      mutate(latestCheckin.id, {
        onSuccess: () => setAnalyzed(true)
      });
    }
  };

  if (!latestCheckin) return null;

  return (
    <GlassCard gradient className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4 text-primary">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">AI Insights</h3>
        </div>

        <AnimatePresence mode="wait">
          {data ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-invert prose-sm"
            >
              <p className="text-lg font-medium leading-relaxed text-white/90">
                {data.analysis}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h4 className="text-xl font-medium text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Unlock insights from today's check-in
              </h4>
              <p className="text-muted-foreground">
                Our AI analyzes your mood, sleep, and stress patterns to provide personalized grounding techniques and observations.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8">
        {!analyzed ? (
          <Button 
            onClick={handleAnalyze} 
            disabled={isPending}
            className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                Generate Insights <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
           <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center justify-center gap-2">
             <Sparkles className="w-4 h-4" /> Analysis complete
           </div>
        )}
      </div>
    </GlassCard>
  );
}
