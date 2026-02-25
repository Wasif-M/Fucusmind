import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { useAISuggestions } from "@/hooks/use-ai";
import { Checkin, ExerciseCompletion } from "@shared/schema";
import { Lightbulb, Loader2, CheckCircle2, AlertTriangle, Dumbbell, Sparkles, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface AIInsightProps {
    latestCheckin?: Checkin;
    exerciseCompletions?: ExerciseCompletion[];
}

type Priority = 'high' | 'medium' | 'low';

export function AIInsight({ latestCheckin, exerciseCompletions }: AIInsightProps) {
    const { mutate, isPending, data } = useAISuggestions();
    const [generated, setGenerated] = useState(false);
    const [expanded, setExpanded] = useState(true);

    const handleGenerate = () => {
        const checkinData = latestCheckin
            ? {
                moodScore: latestCheckin.moodScore,
                sleepHours: latestCheckin.sleepHours,
                stressLevel: latestCheckin.stressLevel,
                notes: latestCheckin.notes || undefined,
            }
            : undefined;

        const exerciseHistory = exerciseCompletions?.length
            ? Array.from(new Set(exerciseCompletions.map((e) => e.exerciseType.replace(/_/g, " "))))
            : undefined;

        mutate(
            { checkinData, exerciseHistory },
            { onSuccess: () => setGenerated(true) }
        );
    };

    const priorityColors = {
        high: "bg-red-500/15 text-red-400 border-red-500/20",
        medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
        low: "bg-green-500/15 text-green-400 border-green-500/20",
    };

    const priorityLabels = {
        high: "High Priority",
        medium: "Recommended",
        low: "Optional",
    };

    return (
        <GlassCard gradient className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-400">
                    <Lightbulb className="w-5 h-5" />
                    <h3 className="font-semibold tracking-wide uppercase text-sm">AI Suggestions</h3>
                </div>
                {data && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-muted-foreground hover:text-white transition-colors p-1"
                    >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {data ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {expanded && (
                            <div className="space-y-6">
                                {/* Daily Tip */}
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                                >
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-amber-400 uppercase tracking-wide mb-1">Daily Tip</p>
                                            <p className="text-sm text-white/90 leading-relaxed">{data.dailyTip}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Strengths & Improvements */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Strengths */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">What You're Doing Well</p>
                                        </div>
                                        <ul className="space-y-2">
                                            {data.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                                    <span className="text-sm text-white/80">{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>

                                    {/* Improvements */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15"
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle className="w-4 h-4 text-blue-400" />
                                            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Areas to Focus On</p>
                                        </div>
                                        <ul className="space-y-2">
                                            {data.improvements.map((imp, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                                                    <span className="text-sm text-white/80">{imp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                </div>

                                {/* Recommended Exercises */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Dumbbell className="w-4 h-4 text-primary" />
                                        <p className="text-xs font-semibold text-primary uppercase tracking-wide">Recommended Exercises</p>
                                    </div>
                                    <div className="space-y-2">
                                        {data.recommendedExercises.map((ex, i) => {
                                            const priority = (ex.priority as Priority) || 'medium';
                                            return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + i * 0.1 }}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-white">{ex.name}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityColors[priority]}`}>
                                                            {priorityLabels[priority]}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{ex.reason}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                {/* Regenerate */}
                                <div className="pt-2">
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={isPending}
                                        variant="outline"
                                        size="sm"
                                        className="w-full rounded-full border-white/10 text-muted-foreground hover:text-white"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" /> Regenerate Suggestions
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h4
                            className="text-xl font-medium text-white mb-2"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                        >
                            Get personalized exercise suggestions
                        </h4>
                        <p className="text-muted-foreground mb-6">
                            Our AI analyzes your check-in data, exercise history, and wellness trends to recommend which exercises
                            you should focus on and what you're already doing great.
                        </p>
                        <Button
                            onClick={handleGenerate}
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-white border border-amber-500/20 backdrop-blur-md"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Suggestions...
                                </>
                            ) : (
                                <>
                                    Get AI Suggestions <Lightbulb className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
