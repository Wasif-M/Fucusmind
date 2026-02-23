import { useState, useEffect, useRef, useCallback, createContext, useContext, useMemo } from "react";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCompleteExercise, useExerciseCompletions, useResetTodayExercises } from "@/hooks/use-exercises";
import { useExerciseSettings, useExerciseFavorites, useExerciseSessions } from "@/hooks/use-exercise-settings";
import { Redirect } from "wouter";
import { Loader2, Wind, Eye, Timer, Play, Pause, RotateCcw, Check, Hand, Ear, Flower2, Coffee, Square, Scan, Heart, Sparkles, TreePine, Lock, Star, Settings, Sliders, Zap, HandHeart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isSameDay } from "date-fns";
import type { ExerciseType } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type ToolsContextType = {
  activeExercise: string | null;
  setActiveExercise: (id: string | null) => void;
  todayCompleted: Set<string>;
  isDisabled: (exerciseId: string) => boolean;
  completeAndRecord: (exerciseType: string) => void;
  // Settings
  breathingDuration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  hapticEnabled: boolean;
  // Favorites
  isFavorite: (exerciseType: string) => boolean;
  toggleFavorite: (exerciseType: string) => void;
  // Session tracking
  recordSession: (data: { exerciseType: string; durationSeconds: number }) => void;
  getTotalDuration: (exerciseType?: string) => number;
  // Haptic helper
  triggerHaptic: (pattern?: number | number[]) => void;
};

const ToolsContext = createContext<ToolsContextType>(null!);
function useTools() { return useContext(ToolsContext); }

// Haptic feedback helper
function triggerHapticFeedback(enabled: boolean, pattern: number | number[] = 50) {
  if (enabled && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

const BREATHING_PHASES = [
  { label: "Breathe In", duration: 4, color: "from-primary to-purple-400" },
  { label: "Hold", duration: 7, color: "from-purple-400 to-pink-400" },
  { label: "Breathe Out", duration: 8, color: "from-pink-400 to-primary" },
];

function CompletedOverlay() {
  return (
    <div className="absolute inset-0 z-20 rounded-2xl bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-3">
        <Check className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium text-white">Completed Today</p>
      <p className="text-xs text-muted-foreground mt-1">Come back tomorrow</p>
    </div>
  );
}

function DisabledOverlay() {
  return (
    <div className="absolute inset-0 z-20 rounded-2xl bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center">
      <Lock className="w-6 h-6 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">Finish your current exercise first</p>
    </div>
  );
}

function FavoriteButton({ exerciseType }: { exerciseType: string }) {
  const { isFavorite, toggleFavorite, triggerHaptic } = useTools();
  const favorite = isFavorite(exerciseType);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic([30, 20, 30]);
    toggleFavorite(exerciseType);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-1.5 rounded-full transition-all ${
        favorite 
          ? "bg-yellow-400/20 hover:bg-yellow-400/30" 
          : "bg-white/10 hover:bg-white/20"
      }`}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star
        className={`w-5 h-5 transition-all ${
          favorite ? "fill-yellow-400 text-yellow-400" : "text-white/70 hover:text-yellow-400"
        }`}
      />
    </button>
  );
}

function SessionStats({ exerciseType }: { exerciseType: string }) {
  const { getTotalDuration } = useTools();
  const totalSeconds = getTotalDuration(exerciseType);
  
  if (totalSeconds === 0) return null;
  
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  
  return (
    <p className="text-xs text-muted-foreground mt-2 text-center">
      Total practice: {mins > 0 ? `${mins}m ` : ""}{secs}s
    </p>
  );
}

function MarkCompleteButton({ exerciseType, onComplete }: { exerciseType: string; onComplete?: () => void }) {
  const { activeExercise, setActiveExercise, todayCompleted, completeAndRecord } = useTools();
  const done = todayCompleted.has(exerciseType);
  const isActive = activeExercise === exerciseType;

  if (done) return null;

  const handleComplete = () => {
    completeAndRecord(exerciseType);
    if (isActive) setActiveExercise(null);
    onComplete?.();
  };

  return (
    <Button
      data-testid={`button-${exerciseType}-complete`}
      variant="outline"
      size="sm"
      className="rounded-full border-green-500/30 text-green-400 hover:border-green-500/50"
      onClick={handleComplete}
    >
      <Check className="mr-1.5 h-3.5 w-3.5" /> Mark Complete
    </Button>
  );
}

function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const { activeExercise, setActiveExercise, todayCompleted, isDisabled, completeAndRecord, breathingDuration, triggerHaptic, recordSession } = useTools();

  // Dynamic phases based on breathingDuration setting (multiplier: 1-8)
  const phases = useMemo(() => [
    { label: "Breathe In", duration: Math.round(4 * breathingDuration / 4), color: "from-primary to-purple-400" },
    { label: "Hold", duration: Math.round(7 * breathingDuration / 4), color: "from-purple-400 to-pink-400" },
    { label: "Breathe Out", duration: Math.round(8 * breathingDuration / 4), color: "from-pink-400 to-primary" },
  ], [breathingDuration]);

  const [countdown, setCountdown] = useState(phases[0].duration);

  const done = todayCompleted.has("breathing");
  const locked = isDisabled("breathing");
  const phase = phases[phaseIndex];

  const stop = useCallback(() => {
    setActive(false);
    setActiveExercise(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhaseIndex(0);
    setCountdown(phases[0].duration);
    // Record session duration
    if (startTimeRef.current > 0) {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (durationSeconds > 0) {
        recordSession({ exerciseType: "breathing", durationSeconds });
      }
      startTimeRef.current = 0;
    }
  }, [setActiveExercise, phases, recordSession]);

  useEffect(() => {
    if (!active) return;

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerHaptic(100); // Haptic on phase change
          setPhaseIndex((pi) => {
            const next = (pi + 1) % phases.length;
            if (next === 0) setCycles((c) => {
              const newCount = c + 1;
              if (newCount === 1) completeAndRecord("breathing");
              triggerHaptic([100, 50, 100]); // Cycle complete haptic
              return newCount;
            });
            return next;
          });
          return phases[(phaseIndex + 1) % phases.length].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, phaseIndex, phases, completeAndRecord, triggerHaptic]);

  const startExercise = () => {
    setActiveExercise("breathing");
    setActive(true);
    startTimeRef.current = Date.now();
    triggerHaptic(50);
  };

  const circleScale = phase.label === "Breathe In" ? 1.3 : phase.label === "Hold" ? 1.3 : 0.8;

  return (
    <GlassCard gradient className="flex flex-col relative overflow-visible">
      {done && <CompletedOverlay />}
      {locked && <DisabledOverlay />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <Wind className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">4-7-8 Breathing</h3>
        </div>
        <FavoriteButton exerciseType="breathing" />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        A calming technique: breathe in for 4s, hold for 7s, exhale for 8s.
      </p>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative w-48 h-48 flex items-center justify-center mb-6">
          <motion.div
            animate={{ scale: active ? circleScale : 1, opacity: active ? 0.6 : 0.3 }}
            transition={{ duration: phase.duration, ease: "easeInOut" }}
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${phase.color} blur-xl`}
          />
          <motion.div
            animate={{ scale: active ? circleScale : 1 }}
            transition={{ duration: phase.duration, ease: "easeInOut" }}
            className={`absolute inset-4 rounded-full bg-gradient-to-br ${phase.color} opacity-30 border border-white/10`}
          />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-4xl font-mono font-bold text-white">{active ? countdown : "--"}</span>
            <span className="text-sm text-white/70 mt-1">{active ? phase.label : "Ready"}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-6">Cycles completed: {cycles}</p>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            data-testid="button-breathing-toggle"
            onClick={() => (active ? stop() : startExercise())}
            className="rounded-full"
            size="lg"
            variant={active ? "outline" : "default"}
          >
            {active ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Start</>}
          </Button>
          {cycles > 0 && !active && (
            <Button
              data-testid="button-breathing-reset"
              variant="ghost"
              size="icon"
              onClick={() => { setCycles(0); stop(); }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <SessionStats exerciseType="breathing" />
      <div className="mt-4 flex justify-center">
        <MarkCompleteButton exerciseType="breathing" onComplete={() => { stop(); setCycles(0); }} />
      </div>
    </GlassCard>
  );
}

const SENSES_STEPS = [
  { count: 5, sense: "things you can SEE", Icon: Eye, color: "text-blue-400" },
  { count: 4, sense: "things you can TOUCH", Icon: Hand, color: "text-green-400" },
  { count: 3, sense: "things you can HEAR", Icon: Ear, color: "text-yellow-400" },
  { count: 2, sense: "things you can SMELL", Icon: Flower2, color: "text-orange-400" },
  { count: 1, sense: "thing you can TASTE", Icon: Coffee, color: "text-pink-400" },
];

function GroundingExercise() {
  const [stepIndex, setStepIndex] = useState(0);
  const [itemsDone, setItemsDone] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const startTimeRef = useRef<number>(0);
  const { activeExercise, setActiveExercise, todayCompleted, isDisabled, completeAndRecord, triggerHaptic, recordSession } = useTools();

  const done = todayCompleted.has("grounding");
  const locked = isDisabled("grounding");
  const step = SENSES_STEPS[stepIndex];
  const remaining = step.count - itemsDone;

  const startExercise = () => {
    setActiveExercise("grounding");
    setStarted(true);
    startTimeRef.current = Date.now();
    triggerHaptic(50);
  };

  const markItem = () => {
    triggerHaptic(30);
    if (itemsDone + 1 >= step.count) {
      if (stepIndex + 1 >= SENSES_STEPS.length) {
        setCompleted(true);
        setActiveExercise(null);
        completeAndRecord("grounding");
        triggerHaptic([100, 50, 100]);
        // Record session
        if (startTimeRef.current > 0) {
          const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
          recordSession({ exerciseType: "grounding", durationSeconds });
          startTimeRef.current = 0;
        }
      } else {
        setStepIndex((s) => s + 1);
        setItemsDone(0);
        triggerHaptic(50);
      }
    } else {
      setItemsDone((i) => i + 1);
    }
  };

  const resetExercise = () => {
    setStepIndex(0);
    setItemsDone(0);
    setCompleted(false);
    setStarted(false);
  };

  return (
    <GlassCard gradient className="flex flex-col relative overflow-visible">
      {done && <CompletedOverlay />}
      {locked && <DisabledOverlay />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <Eye className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">5-4-3-2-1 Grounding</h3>
        </div>
        <FavoriteButton exerciseType="grounding" />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Use your senses to anchor yourself to the present moment.
      </p>

      <AnimatePresence mode="wait">
        {!started && !completed ? (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-4">
              <Eye className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground mb-6">Ground yourself using your five senses.</p>
            <Button data-testid="button-grounding-start" onClick={startExercise} className="rounded-full" size="lg">
              <Play className="mr-2 h-4 w-4" /> Begin
            </Button>
          </motion.div>
        ) : completed ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-display font-semibold text-white mb-2">You're grounded</h4>
            <p className="text-muted-foreground text-sm mb-6">Great job bringing your awareness to the present.</p>
            <Button data-testid="button-grounding-restart" variant="outline" onClick={resetExercise} className="rounded-full">
              <RotateCcw className="mr-2 h-4 w-4" /> Do Again
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center gap-1 mb-6">
              {SENSES_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < stepIndex ? "bg-primary" : i === stepIndex ? "bg-primary/60" : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            <div className="text-center flex-1 flex flex-col items-center justify-center py-4">
              <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${step.color}`}>
                <step.Icon className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-display font-medium text-white mb-1">
                Name {remaining} more {step.sense}
              </h4>
              <p className="text-muted-foreground text-xs">
                {itemsDone}/{step.count} identified
              </p>
            </div>

            <Button
              data-testid="button-grounding-next"
              onClick={markItem}
              className="w-full rounded-xl mt-4"
            >
              I found one
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <SessionStats exerciseType="grounding" />
      <div className="mt-4 flex justify-center">
        <MarkCompleteButton exerciseType="grounding" onComplete={resetExercise} />
      </div>
    </GlassCard>
  );
}

function MeditationTimer() {
  const [duration, setDuration] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [active, setActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const { activeExercise, setActiveExercise, todayCompleted, isDisabled, completeAndRecord, triggerHaptic, recordSession } = useTools();

  const done = todayCompleted.has("meditation");
  const locked = isDisabled("meditation");

  const presets = [
    { label: "2 min", value: 120 },
    { label: "5 min", value: 300 },
    { label: "10 min", value: 600 },
    { label: "15 min", value: 900 },
  ];

  useEffect(() => {
    if (!active) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setActive(false);
          setActiveExercise(null);
          completeAndRecord("meditation");
          triggerHaptic([100, 50, 100, 50, 100]); // Completion haptic
          // Record session
          if (startTimeRef.current > 0) {
            const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
            recordSession({ exerciseType: "meditation", durationSeconds });
            startTimeRef.current = 0;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, triggerHaptic, recordSession, completeAndRecord, setActiveExercise]);

  const selectDuration = (val: number) => {
    setDuration(val);
    setRemaining(val);
    setActive(false);
    triggerHaptic(20);
  };

  const progress = ((duration - remaining) / duration) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const startMeditation = () => {
    setActiveExercise("meditation");
    if (remaining === 0) setRemaining(duration);
    setActive(true);
    startTimeRef.current = Date.now();
    triggerHaptic(50);
  };

  const pauseMeditation = () => {
    setActive(false);
    setActiveExercise(null);
    triggerHaptic(30);
  };

  return (
    <GlassCard gradient className="flex flex-col relative overflow-visible">
      {done && <CompletedOverlay />}
      {locked && <DisabledOverlay />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <Timer className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">Meditation Timer</h3>
        </div>
        <FavoriteButton exerciseType="meditation" />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Sit comfortably, close your eyes, and focus on your breath.
      </p>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative w-40 h-40 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="hsl(265, 89%, 66%)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-mono font-bold text-white">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {presets.map((p) => (
            <Button
              data-testid={`button-timer-${p.value}`}
              key={p.value}
              variant={duration === p.value ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => selectDuration(p.value)}
              disabled={active}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            data-testid="button-timer-toggle"
            onClick={() => active ? pauseMeditation() : startMeditation()}
            className="rounded-full"
            size="lg"
            variant={active ? "outline" : "default"}
          >
            {active ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> {remaining === 0 ? "Restart" : "Start"}</>}
          </Button>
          {!active && remaining !== duration && (
            <Button
              data-testid="button-timer-reset"
              variant="ghost"
              size="icon"
              onClick={() => { setRemaining(duration); setActive(false); }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        {remaining === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-green-400 text-sm font-medium"
          >
            Session complete. Well done.
          </motion.p>
        )}
      </div>
      <SessionStats exerciseType="meditation" />
      <div className="mt-4 flex justify-center">
        <MarkCompleteButton exerciseType="meditation" onComplete={() => { setActive(false); setActiveExercise(null); if (intervalRef.current) clearInterval(intervalRef.current); setRemaining(duration); }} />
      </div>
    </GlassCard>
  );
}

const BOX_PHASES = [
  { label: "Breathe In", duration: 4 },
  { label: "Hold", duration: 4 },
  { label: "Breathe Out", duration: 4 },
  { label: "Hold", duration: 4 },
];

function BoxBreathing() {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(4);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const { activeExercise, setActiveExercise, todayCompleted, isDisabled, completeAndRecord, triggerHaptic, recordSession } = useTools();

  const done = todayCompleted.has("box_breathing");
  const locked = isDisabled("box_breathing");
  const phase = BOX_PHASES[phaseIndex];

  const stop = useCallback(() => {
    setActive(false);
    setActiveExercise(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhaseIndex(0);
    setCountdown(4);
    if (startTimeRef.current > 0) {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (durationSeconds > 0) recordSession({ exerciseType: "box_breathing", durationSeconds });
      startTimeRef.current = 0;
    }
  }, [setActiveExercise, recordSession]);

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerHaptic(80);
          setPhaseIndex((pi) => {
            const next = (pi + 1) % BOX_PHASES.length;
            if (next === 0) setCycles((c) => {
              const newCount = c + 1;
              if (newCount === 1) completeAndRecord("box_breathing");
              triggerHaptic([100, 50, 100]);
              return newCount;
            });
            return next;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, phaseIndex, triggerHaptic, completeAndRecord]);

  const sideIndex = phaseIndex;

  const startExercise = () => {
    setActiveExercise("box_breathing");
    setActive(true);
    startTimeRef.current = Date.now();
    triggerHaptic(50);
  };

  return (
    <GlassCard gradient className="flex flex-col relative overflow-visible">
      {done && <CompletedOverlay />}
      {locked && <DisabledOverlay />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <Square className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">Box Breathing</h3>
        </div>
        <FavoriteButton exerciseType="box_breathing" />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Equal 4-second intervals: inhale, hold, exhale, hold. Used by Navy SEALs.
      </p>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="relative w-40 h-40 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {[0,1,2,3].map((i) => {
              const points = [
                { x1: 15, y1: 15, x2: 85, y2: 15 },
                { x1: 85, y1: 15, x2: 85, y2: 85 },
                { x1: 85, y1: 85, x2: 15, y2: 85 },
                { x1: 15, y1: 85, x2: 15, y2: 15 },
              ][i];
              return (
                <line key={i} {...points}
                  stroke={active && sideIndex === i ? "hsl(265, 89%, 66%)" : "rgba(255,255,255,0.1)"}
                  strokeWidth={active && sideIndex === i ? "3" : "1.5"}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-mono font-bold text-white">{active ? countdown : "--"}</span>
            <span className="text-xs text-white/60 mt-1">{active ? phase.label : "Ready"}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-6">Cycles: {cycles}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button data-testid="button-box-toggle" onClick={() => (active ? stop() : startExercise())} className="rounded-full" size="lg" variant={active ? "outline" : "default"}>
            {active ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Start</>}
          </Button>
          {cycles > 0 && !active && (
            <Button data-testid="button-box-reset" variant="ghost" size="icon" onClick={() => { setCycles(0); stop(); }}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <SessionStats exerciseType="box_breathing" />
      <div className="mt-4 flex justify-center">
        <MarkCompleteButton exerciseType="box_breathing" onComplete={() => { stop(); setCycles(0); }} />
      </div>
    </GlassCard>
  );
}

const BODY_PARTS = [
  "feet and toes",
  "calves and shins",
  "thighs and hips",
  "stomach and lower back",
  "chest and upper back",
  "hands and arms",
  "shoulders and neck",
  "face and head",
];

function BodyScan() {
  const [started, setStarted] = useState(false);
  const [partIndex, setPartIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const startTimeRef = useRef<number>(0);
  const { activeExercise, setActiveExercise, todayCompleted, isDisabled, completeAndRecord, triggerHaptic, recordSession } = useTools();

  const done = todayCompleted.has("body_scan");
  const locked = isDisabled("body_scan");
  const progress = ((partIndex + 1) / BODY_PARTS.length) * 100;

  const startExercise = () => {
    setActiveExercise("body_scan");
    setStarted(true);
    startTimeRef.current = Date.now();
    triggerHaptic(50);
  };

  const next = () => {
    triggerHaptic(30);
    if (partIndex + 1 >= BODY_PARTS.length) {
      setCompleted(true);
      setActiveExercise(null);
      completeAndRecord("body_scan");
      triggerHaptic([100, 50, 100]);
      if (startTimeRef.current > 0) {
        const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        recordSession({ exerciseType: "body_scan", durationSeconds });
        startTimeRef.current = 0;
      }
    } else {
      setPartIndex((p) => p + 1);
    }
  };

  const reset = () => {
    setStarted(false);
    setPartIndex(0);
    setCompleted(false);
  };

  return (
    <GlassCard gradient className="flex flex-col relative overflow-visible">
      {done && <CompletedOverlay />}
      {locked && <DisabledOverlay />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <Scan className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">Body Scan</h3>
        </div>
        <FavoriteButton exerciseType="body_scan" />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Progressively relax each part of your body from feet to head.
      </p>

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-4">
              <Scan className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-6">Find a comfortable position. Close your eyes and begin noticing your body.</p>
            <Button data-testid="button-bodyscan-start" onClick={startExercise} className="rounded-full" size="lg">
              <Play className="mr-2 h-4 w-4" /> Begin Scan
            </Button>
          </motion.div>
        ) : completed ? (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-display font-semibold text-white mb-2">Scan Complete</h4>
            <p className="text-muted-foreground text-sm mb-6">Your whole body has been relaxed and released.</p>
            <Button data-testid="button-bodyscan-restart" variant="outline" onClick={reset} className="rounded-full">
              <RotateCcw className="mr-2 h-4 w-4" /> Start Over
            </Button>
          </motion.div>
        ) : (
          <motion.div key={partIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
            <div className="w-full bg-white/5 rounded-full h-1.5 mb-6">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-center flex-1 flex flex-col items-center justify-center py-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Focus on your</p>
              <h4 className="text-xl font-display font-medium text-white mb-4 capitalize">{BODY_PARTS[partIndex]}</h4>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Notice any tension. Breathe into this area and let it soften as you exhale.
              </p>
            </div>
            <Button data-testid="button-bodyscan-next" onClick={next} className="w-full rounded-xl mt-4">
              {partIndex + 1 >= BODY_PARTS.length ? "Complete" : "Next Area"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <SessionStats exerciseType="body_scan" />
      <div className="mt-4 flex justify-center">
        <MarkCompleteButton exerciseType="body_scan" onComplete={reset} />
      </div>
    </GlassCard>
  );
}

const GRATITUDE_PROMPTS = [
  "Something that made you smile today",
  "A person you're grateful for",
  "A small comfort you often overlook",
  "Something beautiful you noticed recently",
  "An ability or skill you're thankful for",
  "A challenge that helped you grow",
];

function GratitudeExercise() {
  const [promptIndex, setPromptIndex] = useState(0);
  const [entries, setEntries] = useState<string[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [completed, setCompleted] = useState(false);
  const [started, setStarted] = useState(false);
  const startTimeRef = useRef<number>(0);
  const { activeExercise, setActiveExercise, todayCompleted, isDisabled, completeAndRecord, triggerHaptic, recordSession } = useTools();

  const done = todayCompleted.has("gratitude");
  const locked = isDisabled("gratitude");

  const startExercise = () => {
    setActiveExercise("gratitude");
    setStarted(true);
    startTimeRef.current = Date.now();
    triggerHaptic(50);
  };

  const saveEntry = () => {
    if (!currentEntry.trim()) return;
    triggerHaptic(30);
    const newEntries = [...entries, currentEntry.trim()];
    setEntries(newEntries);
    setCurrentEntry("");
    if (newEntries.length >= 3) {
      setCompleted(true);
      setActiveExercise(null);
      completeAndRecord("gratitude");
      triggerHaptic([100, 50, 100]);
      if (startTimeRef.current > 0) {
        const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        recordSession({ exerciseType: "gratitude", durationSeconds });
        startTimeRef.current = 0;
      }
    } else {
      setPromptIndex((p) => (p + 1) % GRATITUDE_PROMPTS.length);
    }
  };

  const reset = () => {
    setEntries([]);
    setCurrentEntry("");
    setPromptIndex(0);
    setCompleted(false);
    setStarted(false);
  };

  return (
    <GlassCard gradient className="flex flex-col relative overflow-visible">
      {done && <CompletedOverlay />}
      {locked && <DisabledOverlay />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <Heart className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">Gratitude Moment</h3>
        </div>
        <FavoriteButton exerciseType="gratitude" />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Name 3 things you're grateful for right now.
      </p>

      <AnimatePresence mode="wait">
        {!started && !completed ? (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-6">Take a moment to appreciate the good things in your life.</p>
            <Button data-testid="button-gratitude-start" onClick={startExercise} className="rounded-full" size="lg">
              <Play className="mr-2 h-4 w-4" /> Begin
            </Button>
          </motion.div>
        ) : completed ? (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-display font-semibold text-white mb-3">Gratitude Captured</h4>
            <div className="space-y-2 mb-6 w-full">
              {entries.map((e, i) => (
                <div key={i} className="text-left bg-white/5 rounded-lg px-3 py-2 text-sm text-white/80">
                  <span className="text-primary mr-2">{i + 1}.</span>{e}
                </div>
              ))}
            </div>
            <Button data-testid="button-gratitude-restart" variant="outline" onClick={reset} className="rounded-full">
              <RotateCcw className="mr-2 h-4 w-4" /> New Session
            </Button>
          </motion.div>
        ) : (
          <motion.div key={entries.length} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
            <div className="flex gap-1 mb-4">
              {[0,1,2].map((i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < entries.length ? "bg-primary" : "bg-white/10"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{entries.length + 1} of 3</p>
            <p className="text-white font-medium mb-4">{GRATITUDE_PROMPTS[promptIndex]}</p>
            <Textarea
              data-testid="input-gratitude"
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="Write something you're grateful for..."
              className="resize-none border-white/10 bg-white/5 text-sm mb-4 flex-1 min-h-[80px]"
            />
            <Button data-testid="button-gratitude-save" onClick={saveEntry} disabled={!currentEntry.trim()} className="w-full rounded-xl">
              Save & Continue
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <SessionStats exerciseType="gratitude" />
      <div className="mt-4 flex justify-center">
        <MarkCompleteButton exerciseType="gratitude" onComplete={reset} />
      </div>
    </GlassCard>
  );
}

const NATURE_JOURNEYS = [
    [
      { title: "A Quiet Forest", description: "Imagine walking along a soft path through tall, ancient trees. Sunlight filters through the canopy above." },
      { title: "Listen Closely", description: "You hear birdsong in the distance and the gentle rustle of leaves. A stream trickles somewhere nearby." },
      { title: "Feel the Air", description: "The air is cool and fresh, carrying the scent of pine and damp earth. You breathe deeply and feel lighter." },
      { title: "Find Your Spot", description: "You come upon a clearing bathed in warm light. You sit down on soft moss and feel completely at peace." },
      { title: "Rest Here", description: "There is nowhere to be and nothing to do. You are safe, calm, and present in this moment." },
    ],
    [
      { title: "The Ocean Shore", description: "You stand barefoot on warm sand. Gentle waves roll toward you, their rhythm slow and steady." },
      { title: "The Sound of Waves", description: "Each wave washes in with a soft hush. Seabirds call overhead as a light breeze touches your skin." },
      { title: "Warmth on Your Skin", description: "The sun rests low in the sky, painting the clouds gold and amber. Its warmth soaks gently into your shoulders." },
      { title: "Walk the Shoreline", description: "You follow the water's edge. Cool foam circles your ankles, then pulls softly back to the sea." },
      { title: "Horizon Peace", description: "You stop and gaze at the endless horizon. Everything feels wide open, still, and calm." },
    ],
    [
      { title: "A Mountain Meadow", description: "You arrive at a high meadow blanketed with wildflowers. The sky above is vast and deeply blue." },
      { title: "A Gentle Breeze", description: "Wind moves through the tall grass in slow waves. You can smell wildflowers and fresh mountain air." },
      { title: "The Distant Peaks", description: "Snow-capped mountains frame the horizon. They stand still and timeless, like old guardians of this place." },
      { title: "Lie in the Grass", description: "You lie back in the soft grass and watch clouds drift overhead. Each one dissolves slowly, unhurried." },
      { title: "Simply Be", description: "The meadow holds you gently. You breathe slowly and feel the earth beneath you, solid and still." },
    ],
    [
      { title: "A Moonlit Lake", description: "You stand at the edge of a glassy lake under a clear night sky. The moon's reflection stretches across the water." },
      { title: "Starlight", description: "Thousands of stars glitter above you. Each one feels impossibly far away and perfectly still." },
      { title: "The Quiet", description: "There is only silence here, broken softly by the occasional ripple of water against the shore." },
      { title: "Sit by the Water", description: "You sit on a smooth stone by the lake. The cool night air is clean and crisp against your face." },
      { title: "Deep Stillness", description: "Everything is at rest. The world sleeps, and you are part of its deep, quiet breathing." },
    ],
    [
      { title: "A Rainy Garden", description: "You step into a lush garden as soft rain begins to fall. Each droplet taps gently on broad green leaves." },
      { title: "The Scent of Rain", description: "The air fills with the earthy perfume of wet soil and blossoms. You breathe it in deeply." },
      { title: "Under the Canopy", description: "You find shelter under a flowering tree. Rain patters on the leaves above while you stay dry and warm." },
      { title: "Watch the Drops", description: "Raindrops collect on petals and roll off slowly. Each one catches the light like a tiny gem." },
      { title: "Gentle Renewal", description: "The rain washes everything clean. You feel refreshed, lighter, as if the rain is washing away tension too." },
    ],
    [
      { title: "A Desert Sunrise", description: "The horizon glows orange and gold as the sun rises over vast, quiet dunes. The air is cool and still." },
      { title: "Warm Light", description: "Sunlight spills across the sand, turning it from shadow to warmth. You feel the first rays on your face." },
      { title: "The Open Space", description: "There is nothing but sky and sand stretching endlessly. The vastness feels freeing, not lonely." },
      { title: "Footprints in Sand", description: "You walk slowly, leaving a trail behind you. Each step feels grounding and intentional." },
      { title: "Stillness of Dawn", description: "The world is waking up around you, but here everything is hushed. You are the first to greet this new day." },
    ],
    [
      { title: "A Bamboo Grove", description: "Tall bamboo stalks sway gently around you, creating a soft rustling sound like whispered secrets." },
      { title: "Dappled Light", description: "Sunlight filters through the bamboo canopy in shifting patterns. Green and gold dance on the path before you." },
      { title: "A Stone Path", description: "You follow a smooth stone path deeper into the grove. Each stone is cool and solid beneath your feet." },
      { title: "A Hidden Pond", description: "You discover a small, still pond surrounded by moss. Lily pads float motionless on its surface." },
      { title: "Inner Calm", description: "You sit by the pond and close your eyes. The bamboo sways, the water rests, and so do you." },
    ],
  ];

function NatureVisualization() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const { activeExercise, setActiveExercise, todayCompleted, isDisabled, completeAndRecord, triggerHaptic, recordSession } = useTools();

  const done = todayCompleted.has("nature");
  const locked = isDisabled("nature");

  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const scenes = NATURE_JOURNEYS[dayOfYear % NATURE_JOURNEYS.length];

  const start = () => {
    setActiveExercise("nature");
    setActive(true);
    setStep(0);
    startTimeRef.current = Date.now();
    triggerHaptic(50);
  };

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setStep((s) => {
        if (s + 1 >= scenes.length) {
          setActive(false);
          setActiveExercise(null);
          completeAndRecord("nature");
          triggerHaptic([100, 50, 100]);
          if (startTimeRef.current > 0) {
            const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
            recordSession({ exerciseType: "nature", durationSeconds });
            startTimeRef.current = 0;
          }
          return s;
        }
        triggerHaptic(40);
        return s + 1;
      });
    }, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, scenes.length, completeAndRecord, triggerHaptic, recordSession, setActiveExercise]);

  const reset = () => {
    setActive(false);
    setStep(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <GlassCard gradient className="flex flex-col relative overflow-visible">
      {done && <CompletedOverlay />}
      {locked && <DisabledOverlay />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <TreePine className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">Nature Visualisation</h3>
        </div>
        <FavoriteButton exerciseType="nature" />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        A gentle guided imagery journey to a calm, safe place.
      </p>

      <AnimatePresence mode="wait">
        {!active && step === 0 ? (
          <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-primary/20 flex items-center justify-center mb-6">
              <TreePine className="w-10 h-10 text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-6">Close your eyes and let the words guide you.</p>
            <Button data-testid="button-nature-start" onClick={start} className="rounded-full" size="lg">
              <Play className="mr-2 h-4 w-4" /> Begin Journey
            </Button>
          </motion.div>
        ) : !active && step === scenes.length - 1 ? (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-display font-semibold text-white mb-2">Journey Complete</h4>
            <p className="text-muted-foreground text-sm mb-6">Carry this calm feeling with you.</p>
            <Button data-testid="button-nature-restart" variant="outline" onClick={reset} className="rounded-full">
              <RotateCcw className="mr-2 h-4 w-4" /> Journey Again
            </Button>
          </motion.div>
        ) : (
          <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.8 }} className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="flex gap-1 mb-6 w-full">
              {scenes.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-700 ${i <= step ? "bg-green-400/60" : "bg-white/10"}`} />
              ))}
            </div>
            <h4 className="text-lg font-display font-medium text-white mb-3">{scenes[step].title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">{scenes[step].description}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <SessionStats exerciseType="nature" />
      <div className="mt-4 flex justify-center">
        <MarkCompleteButton exerciseType="nature" onComplete={reset} />
      </div>
    </GlassCard>
  );
}

// Progressive Muscle Relaxation Exercise
const PMR_MUSCLE_GROUPS = [
  { name: "Feet", instruction: "Curl your toes tightly, hold the tension..." },
  { name: "Calves", instruction: "Point your toes up, tensing your calf muscles..." },
  { name: "Thighs", instruction: "Squeeze your thigh muscles tightly..." },
  { name: "Glutes", instruction: "Clench your buttocks firmly..." },
  { name: "Abdomen", instruction: "Tighten your stomach muscles..." },
  { name: "Chest", instruction: "Take a deep breath, hold and tense your chest..." },
  { name: "Hands", instruction: "Make tight fists with both hands..." },
  { name: "Arms", instruction: "Flex your biceps, pulling your forearms up..." },
  { name: "Shoulders", instruction: "Raise your shoulders up towards your ears..." },
  { name: "Face", instruction: "Scrunch your face: eyes, jaw, and forehead..." },
];

function PMRExercise() {
  const { isDisabled, completeAndRecord, setActiveExercise, triggerHaptic, recordSession } = useTools();
  const done = useTools().todayCompleted.has("pmr");
  const locked = isDisabled("pmr");

  const [started, setStarted] = useState(false);
  const [muscleIndex, setMuscleIndex] = useState(0);
  const [phase, setPhase] = useState<"tense" | "release">("tense");
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const startTimeRef = useRef<number>(0);

  const currentMuscle = PMR_MUSCLE_GROUPS[muscleIndex];

  const startExercise = () => {
    setActiveExercise("pmr");
    setStarted(true);
    setMuscleIndex(0);
    setPhase("tense");
    setCountdown(5);
    startTimeRef.current = Date.now();
    triggerHaptic(50);
  };

  useEffect(() => {
    if (!started || completed) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (phase === "tense") {
            setPhase("release");
            triggerHaptic([20, 40, 20]);
            return 5;
          } else {
            // Move to next muscle group
            if (muscleIndex < PMR_MUSCLE_GROUPS.length - 1) {
              setMuscleIndex((i) => i + 1);
              setPhase("tense");
              triggerHaptic(30);
              return 5;
            } else {
              // Complete
              setCompleted(true);
              clearInterval(timer);
              triggerHaptic([50, 50, 50, 50]);
              if (startTimeRef.current > 0) {
                const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
                recordSession("pmr", durationSeconds);
                startTimeRef.current = 0;
              }
              return 0;
            }
          }
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, completed, phase, muscleIndex, triggerHaptic, recordSession]);

  const reset = () => {
    setStarted(false);
    setMuscleIndex(0);
    setPhase("tense");
    setCountdown(5);
    setCompleted(false);
    setActiveExercise(null);
  };

  return (
    <GlassCard gradient className="flex flex-col relative overflow-visible">
      {done && <CompletedOverlay />}
      {locked && <DisabledOverlay />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <Zap className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">Muscle Relaxation</h3>
        </div>
        <FavoriteButton exerciseType="pmr" />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Tense and release each muscle group for deep relaxation.
      </p>

      <AnimatePresence mode="wait">
        {!started && !completed ? (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-6">Progressive muscle relaxation releases physical tension.</p>
            <Button data-testid="button-pmr-start" onClick={startExercise} className="rounded-full" size="lg">
              <Play className="mr-2 h-4 w-4" /> Begin
            </Button>
          </motion.div>
        ) : completed ? (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-display font-semibold text-white mb-2">Fully Relaxed</h4>
            <p className="text-muted-foreground text-sm mb-6">Your body is now deeply relaxed.</p>
            <Button data-testid="button-pmr-restart" variant="outline" onClick={reset} className="rounded-full">
              <RotateCcw className="mr-2 h-4 w-4" /> Again
            </Button>
          </motion.div>
        ) : (
          <motion.div key={muscleIndex + phase} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="flex gap-1 mb-4 w-full">
              {PMR_MUSCLE_GROUPS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < muscleIndex ? "bg-green-400/60" : i === muscleIndex ? "bg-primary/80" : "bg-white/10"}`} />
              ))}
            </div>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${phase === "tense" ? "bg-orange-500/30 scale-110" : "bg-green-500/30 scale-100"}`}>
              <span className="text-2xl font-bold text-white">{countdown}</span>
            </div>
            <h4 className="text-lg font-display font-medium text-white mb-1">{currentMuscle.name}</h4>
            <p className={`text-sm font-semibold mb-2 ${phase === "tense" ? "text-orange-400" : "text-green-400"}`}>
              {phase === "tense" ? "TENSE" : "RELEASE & RELAX"}
            </p>
            <p className="text-xs text-muted-foreground text-center max-w-[250px]">
              {phase === "tense" ? currentMuscle.instruction : "Let go of the tension, feel the warmth..."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <SessionStats exerciseType="pmr" />
      <div className="mt-4 flex justify-center">
        <MarkCompleteButton exerciseType="pmr" onComplete={reset} />
      </div>
    </GlassCard>
  );
}

// Butterfly Hug Exercise
function ButterflyHugExercise() {
  const { isDisabled, completeAndRecord, setActiveExercise, triggerHaptic, recordSession } = useTools();
  const done = useTools().todayCompleted.has("butterfly_hug");
  const locked = isDisabled("butterfly_hug");

  const [active, setActive] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [currentSide, setCurrentSide] = useState<"left" | "right">("left");
  const [completed, setCompleted] = useState(false);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const TARGET_TAPS = 60; // 30 per side

  const startExercise = () => {
    setActiveExercise("butterfly_hug");
    setActive(true);
    setTapCount(0);
    setCurrentSide("left");
    startTimeRef.current = Date.now();
    triggerHaptic(50);
  };

  useEffect(() => {
    if (!active) return;

    intervalRef.current = setInterval(() => {
      setTapCount((c) => {
        const newCount = c + 1;
        if (newCount >= TARGET_TAPS) {
          setActive(false);
          setCompleted(true);
          if (intervalRef.current) clearInterval(intervalRef.current);
          triggerHaptic([50, 50, 50]);
          if (startTimeRef.current > 0) {
            const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
            recordSession("butterfly_hug", durationSeconds);
            startTimeRef.current = 0;
          }
          return newCount;
        }
        setCurrentSide((s) => s === "left" ? "right" : "left");
        triggerHaptic(15);
        return newCount;
      });
    }, 800); // ~75 BPM bilateral tapping

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, triggerHaptic, recordSession]);

  const reset = () => {
    setActive(false);
    setTapCount(0);
    setCurrentSide("left");
    setCompleted(false);
    setActiveExercise(null);
  };

  const progress = (tapCount / TARGET_TAPS) * 100;

  return (
    <GlassCard gradient className="flex flex-col relative overflow-visible">
      {done && <CompletedOverlay />}
      {locked && <DisabledOverlay />}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          <HandHeart className="w-5 h-5" />
          <h3 className="font-semibold tracking-wide uppercase text-sm">Butterfly Hug</h3>
        </div>
        <FavoriteButton exerciseType="butterfly_hug" />
      </div>
      <p className="text-muted-foreground text-sm mb-6">
        Cross arms over chest, alternately tap shoulders for calm.
      </p>

      <AnimatePresence mode="wait">
        {!active && !completed ? (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary mb-4">
              <HandHeart className="w-8 h-8" />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-[250px]">
              Cross your arms over your chest with hands near shoulders. Alternately tap left and right.
            </p>
            <Button data-testid="button-butterfly-start" onClick={startExercise} className="rounded-full" size="lg">
              <Play className="mr-2 h-4 w-4" /> Begin
            </Button>
          </motion.div>
        ) : completed ? (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-display font-semibold text-white mb-2">Well Done</h4>
            <p className="text-muted-foreground text-sm mb-6">You've calmed your nervous system.</p>
            <Button data-testid="button-butterfly-restart" variant="outline" onClick={reset} className="rounded-full">
              <RotateCcw className="mr-2 h-4 w-4" /> Again
            </Button>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center py-6">
            <div className="relative w-32 h-32 mb-4">
              {/* Progress ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="44" fill="none"
                  stroke="hsl(265, 89%, 66%)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
                  className="transition-all duration-300"
                />
              </svg>
              {/* Hands animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: currentSide === "left" ? 1.2 : 0.9, opacity: currentSide === "left" ? 1 : 0.4 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl absolute left-2"
                >
                  🤚
                </motion.div>
                <motion.div
                  animate={{ scale: currentSide === "right" ? 1.2 : 0.9, opacity: currentSide === "right" ? 1 : 0.4 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl absolute right-2"
                  style={{ transform: "scaleX(-1)" }}
                >
                  🤚
                </motion.div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Tap: <span className={`font-semibold ${currentSide === "left" ? "text-primary" : "text-pink-400"}`}>
                {currentSide === "left" ? "Left" : "Right"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">{tapCount} / {TARGET_TAPS} taps</p>
            <Button data-testid="button-butterfly-stop" variant="ghost" size="sm" onClick={reset} className="mt-4 text-muted-foreground">
              <Pause className="mr-2 h-3 w-3" /> Stop
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <SessionStats exerciseType="butterfly_hug" />
      <div className="mt-4 flex justify-center">
        <MarkCompleteButton exerciseType="butterfly_hug" onComplete={reset} />
      </div>
    </GlassCard>
  );
}

// Settings Panel Component
function SettingsPanel() {
  const { settings, updateSettings, isUpdating } = useExerciseSettings();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Sliders className="mr-2 h-4 w-4" />
        Settings
      </Button>
      
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-12 z-50 w-80 glass-panel rounded-xl p-4 border border-white/10 bg-zinc-900/95 backdrop-blur-xl"
          >
            <h4 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Exercise Settings
            </h4>
            
            <div className="space-y-4">
              {/* Breathing Duration */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Breathing Duration</Label>
                <Select
                  value={String(settings.breathingDuration)}
                  onValueChange={(val) => updateSettings({ breathingDuration: parseInt(val) })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Short (2s base)</SelectItem>
                    <SelectItem value="4">Standard (4s base)</SelectItem>
                    <SelectItem value="6">Extended (6s base)</SelectItem>
                    <SelectItem value="8">Long (8s base)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Difficulty */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Difficulty Level</Label>
                <Select
                  value={settings.difficulty}
                  onValueChange={(val) => updateSettings({ difficulty: val as "beginner" | "intermediate" | "advanced" })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Haptic Feedback */}
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Haptic Feedback</Label>
                <Switch
                  checked={settings.hapticEnabled}
                  onCheckedChange={(checked) => updateSettings({ hapticEnabled: checked })}
                />
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              onClick={() => setShowSettings(false)}
            >
              Close
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolsGrid() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BreathingExercise />
      <GroundingExercise />
      <MeditationTimer />
      <BoxBreathing />
      <BodyScan />
      <GratitudeExercise />
      <NatureVisualization />
      <PMRExercise />
      <ButterflyHugExercise />
    </div>
  );
}

export default function GroundingTools() {
  const { user, isLoading } = useAuth();
  const { data: completions } = useExerciseCompletions();
  const { mutate: completeExerciseMut } = useCompleteExercise();
  const { mutate: resetExercises, isPending: isResetting } = useResetTodayExercises();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  
  // Settings, favorites, and sessions
  const { settings } = useExerciseSettings();
  const { isFavorite, toggleFavorite } = useExerciseFavorites();
  const { recordSession, getTotalDuration } = useExerciseSessions();

  const todayCompleted = useMemo(() => {
    const today = new Date();
    const set = new Set<string>();
    (completions || []).forEach((c) => {
      if (isSameDay(new Date(c.completedAt!), today)) {
        set.add(c.exerciseType);
      }
    });
    return set;
  }, [completions]);

  const isDisabled = useCallback((exerciseId: string) => {
    if (todayCompleted.has(exerciseId)) return false;
    return activeExercise !== null && activeExercise !== exerciseId;
  }, [activeExercise, todayCompleted]);

  const completeAndRecord = useCallback((exerciseType: string) => {
    if (!todayCompleted.has(exerciseType)) {
      completeExerciseMut(exerciseType);
    }
  }, [completeExerciseMut, todayCompleted]);

  // Haptic helper
  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
    triggerHapticFeedback(settings.hapticEnabled, pattern);
  }, [settings.hapticEnabled]);

  const contextValue = useMemo(() => ({
    activeExercise,
    setActiveExercise,
    todayCompleted,
    isDisabled,
    completeAndRecord,
    breathingDuration: settings.breathingDuration,
    difficulty: settings.difficulty,
    hapticEnabled: settings.hapticEnabled,
    isFavorite,
    toggleFavorite,
    recordSession,
    getTotalDuration,
    triggerHaptic,
  }), [activeExercise, todayCompleted, isDisabled, completeAndRecord, settings, isFavorite, toggleFavorite, recordSession, getTotalDuration, triggerHaptic]);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (!user) return <Redirect to="/" />;

  return (
    <ToolsContext.Provider value={contextValue}>
      <div className="min-h-full bg-background bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-semibold mb-2 text-white leading-tight">
                <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>Grounding</span> Tools
              </h1>
              <p className="text-[#a0a0b4] text-lg">
                Techniques to calm your mind and anchor you in the present moment.
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <SettingsPanel />
              {todayCompleted.size > 0 && (
                <Button
                  variant="outline"
                  onClick={() => resetExercises()}
                  disabled={isResetting}
                  className="rounded-full"
                  data-testid="button-reset-exercises"
                >
                  {isResetting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
                  ) : (
                    <><RotateCcw className="mr-2 h-4 w-4" /> Reset All Exercises</>
                  )}
                </Button>
              )}
            </div>
          </div>
          <ToolsGrid />
        </main>
      </div>
    </ToolsContext.Provider>
  );
}
