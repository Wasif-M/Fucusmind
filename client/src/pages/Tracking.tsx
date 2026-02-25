import { useState, useMemo, useRef } from "react";
import { useCheckins } from "@/hooks/use-checkins";
import { useExerciseCompletions } from "@/hooks/use-exercises";
import { useGoals } from "@/hooks/use-goals";
import { CheckinDialog } from "@/components/checkin-dialog";
import { AIInsight } from "@/components/dashboard/AIInsight";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, Circle, ChevronLeft, ChevronRight, Smile, BedDouble, Gauge, Plus, Dumbbell, Target, TrendingUp, Download, X, Calendar } from "lucide-react";
import { format, isSameDay, addDays, subDays, isToday, startOfMonth, eachDayOfInterval, endOfMonth, startOfWeek, endOfWeek, subWeeks, parseISO } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { EXERCISE_TYPES } from "@shared/schema";
import type { ExerciseCompletion, Checkin, UserProfile } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, LineChart, Line, Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";

function getExercisesForDay(completions: ExerciseCompletion[], day: Date) {
  const dayStr = format(day, "yyyy-MM-dd");
  return completions.filter((c) => format(new Date(c.completedAt!), "yyyy-MM-dd") === dayStr);
}

function getUniqueExerciseTypes(dayCompletions: ExerciseCompletion[]): string[] {
  return Array.from(new Set(dayCompletions.map((c) => c.exerciseType)));
}

function getDayScore(dayCompletions: ExerciseCompletion[]): number {
  return getUniqueExerciseTypes(dayCompletions).length;
}

function ProgressRing({
  value,
  goal,
  color,
  label,
  icon: Icon,
  suffix = "",
  invert = false,
}: {
  value: number | null;
  goal: number;
  color: string;
  label: string;
  icon: typeof Smile;
  suffix?: string;
  invert?: boolean;
}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  let percent = 0;
  let ringColor = color;
  
  if (value !== null) {
    if (invert) {
      // For stress: lower is better
      // Show the actual value as percentage of 10 (max)
      // Color indicates whether it's good (green) or bad (red)
      const maxValue = 10;
      percent = (value / maxValue) * 100;
      // Color: green if at/below goal, yellow if slightly above, red if high
      if (value <= goal) {
        ringColor = "#22c55e"; // green - stress is at or below goal
      } else if (value <= goal + 2) {
        ringColor = "#eab308"; // yellow - slightly above goal  
      } else {
        ringColor = "#ef4444"; // red - stress is high
      }
    } else {
      // For mood, sleep, exercises: higher is better
      percent = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
      ringColor = percent >= 80 ? "#22c55e" : percent >= 50 ? color : "#ef4444";
    }
  }
  
  const offset = circ * (1 - percent / 100);

  return (
    <div className="flex flex-col items-center gap-2" data-testid={`progress-ring-${label.toLowerCase()}`}>
      <div className="relative w-[100px] h-[100px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={ringColor}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-white leading-none">{value !== null ? value : "--"}{suffix}</span>
          <span className="text-[10px] text-[#6b6b80] leading-tight">/ {invert ? 10 : goal}{suffix}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs text-[#a0a0b4]">{label}</span>
      </div>
    </div>
  );
}

function MonthlyOverview({ checkins }: { checkins: Checkin[] }) {
  const now = new Date();
  const monthDays = eachDayOfInterval({ start: startOfMonth(now), end: now });

  const chartData = monthDays.map((day) => {
    const dayKey = format(day, "yyyy-MM-dd");
    const checkin = checkins.find((c) => c.createdAt!.toString().split('T')[0] === dayKey);
    return {
      date: format(day, "d"),
      mood: checkin?.moodScore ?? 0,
      stress: checkin?.stressLevel ?? 0,
      sleep: checkin?.sleepHours ?? 0,
      fullDate: format(day, "MMM d"),
    };
  });

  if (checkins.length < 1) return null;

  return (
    <GlassCard>
      <h3 className="text-lg font-semibold text-white mb-4">
        Monthly Overview
        <span className="text-sm font-normal text-muted-foreground ml-2">{format(now, "MMMM yyyy")}</span>
      </h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={0} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={monthDays.length > 20 ? 1 : 0}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 12]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(9, 9, 11, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload.length > 0) {
                  return (payload[0].payload as any).fullDate;
                }
                return "";
              }}
            />
            <Bar dataKey="mood" fill="hsl(265, 89%, 66%)" radius={[2, 2, 0, 0]} name="Mood" />
            <Bar dataKey="sleep" fill="#60a5fa" radius={[2, 2, 0, 0]} name="Sleep" />
            <Bar dataKey="stress" fill="#f472b6" radius={[2, 2, 0, 0]} name="Stress" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// Week-over-week comparison component
function WeekComparison({ checkins }: { checkins: Checkin[] }) {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const lastWeekEnd = subWeeks(thisWeekEnd, 1);

  const thisWeekCheckins = checkins.filter(c => {
    const date = new Date(c.createdAt!);
    return date >= thisWeekStart && date <= thisWeekEnd;
  });

  const lastWeekCheckins = checkins.filter(c => {
    const date = new Date(c.createdAt!);
    return date >= lastWeekStart && date <= lastWeekEnd;
  });

  const avgThis = {
    mood: thisWeekCheckins.length ? thisWeekCheckins.reduce((s, c) => s + c.moodScore, 0) / thisWeekCheckins.length : 0,
    sleep: thisWeekCheckins.length ? thisWeekCheckins.reduce((s, c) => s + c.sleepHours, 0) / thisWeekCheckins.length : 0,
    stress: thisWeekCheckins.length ? thisWeekCheckins.reduce((s, c) => s + c.stressLevel, 0) / thisWeekCheckins.length : 0,
  };

  const avgLast = {
    mood: lastWeekCheckins.length ? lastWeekCheckins.reduce((s, c) => s + c.moodScore, 0) / lastWeekCheckins.length : 0,
    sleep: lastWeekCheckins.length ? lastWeekCheckins.reduce((s, c) => s + c.sleepHours, 0) / lastWeekCheckins.length : 0,
    stress: lastWeekCheckins.length ? lastWeekCheckins.reduce((s, c) => s + c.stressLevel, 0) / lastWeekCheckins.length : 0,
  };

  const chartData = [
    { name: 'Mood', thisWeek: avgThis.mood.toFixed(1), lastWeek: avgLast.mood.toFixed(1) },
    { name: 'Sleep', thisWeek: avgThis.sleep.toFixed(1), lastWeek: avgLast.sleep.toFixed(1) },
    { name: 'Stress', thisWeek: avgThis.stress.toFixed(1), lastWeek: avgLast.stress.toFixed(1) },
  ];

  if (checkins.length < 1) return null;

  return (
    <GlassCard className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Week-over-Week
        </h3>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 10]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(9, 9, 11, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
            />
            <Legend />
            <Bar dataKey="lastWeek" fill="#6b6b80" radius={[4, 4, 0, 0]} name="Last Week" />
            <Bar dataKey="thisWeek" fill="#9b6dff" radius={[4, 4, 0, 0]} name="This Week" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

// Sleep-Mood Correlation Component
function SleepMoodCorrelation({ checkins }: { checkins: Checkin[] }) {
  const data = checkins.map(c => ({
    sleep: c.sleepHours,
    mood: c.moodScore,
    date: format(new Date(c.createdAt!), "MMM d"),
  }));

  if (data.length < 3) return null;

  // Calculate correlation coefficient
  const n = data.length;
  const sumX = data.reduce((s, d) => s + d.sleep, 0);
  const sumY = data.reduce((s, d) => s + d.mood, 0);
  const sumXY = data.reduce((s, d) => s + d.sleep * d.mood, 0);
  const sumX2 = data.reduce((s, d) => s + d.sleep * d.sleep, 0);
  const sumY2 = data.reduce((s, d) => s + d.mood * d.mood, 0);
  
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  const correlationPercent = Math.round(Math.abs(correlation) * 100);
  const correlationLabel = correlation > 0.5 ? "Strong positive" : 
    correlation > 0.2 ? "Moderate positive" : 
    correlation > -0.2 ? "Weak" :
    correlation > -0.5 ? "Moderate negative" : "Strong negative";

  return (
    <GlassCard className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Sleep-Mood Correlation</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${correlation > 0.3 ? 'text-green-400' : correlation < -0.3 ? 'text-red-400' : 'text-yellow-400'}`}>
            {correlationLabel}
          </span>
          <span className="text-xs text-muted-foreground">({correlationPercent}%)</span>
        </div>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="sleep" name="Sleep" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} domain={[0, 12]} label={{ value: 'Sleep (hrs)', position: 'bottom', fill: '#6b6b80', fontSize: 10 }} />
            <YAxis dataKey="mood" name="Mood" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} domain={[0, 10]} label={{ value: 'Mood', angle: -90, position: 'left', fill: '#6b6b80', fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(9, 9, 11, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
              formatter={(value: number, name: string) => [value, name]}
              labelFormatter={() => ''}
            />
            <Scatter data={data} fill="#9b6dff" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {correlation > 0.3 
          ? "Better sleep tends to improve your mood!" 
          : correlation < -0.3 
            ? "Interesting - your mood seems inversely related to sleep." 
            : "Sleep and mood don't show a strong pattern yet. Keep tracking!"}
      </p>
    </GlassCard>
  );
}

// Goal Setting Dialog
function GoalSettingDialog() {
  const { goals, createGoal, isCreating } = useGoals();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [goalType, setGoalType] = useState("mood");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    createGoal({
      title,
      goalType,
      targetValue: targetValue ? parseInt(targetValue) : undefined,
      targetDate: targetDate || undefined,
    });
    setTitle("");
    setTargetValue("");
    setTargetDate("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <Target className="mr-2 h-4 w-4" />
          Set Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel bg-zinc-950/95 border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-display">Create a New Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Goal Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Improve sleep quality"
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Goal Type</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mood">Mood</SelectItem>
                <SelectItem value="sleep">Sleep</SelectItem>
                <SelectItem value="stress">Stress</SelectItem>
                <SelectItem value="exercise">Exercise</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Target Value (optional)</Label>
            <Input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="e.g., 8"
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Target Date (optional)</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <Button onClick={handleSubmit} disabled={!title.trim() || isCreating} className="w-full">
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create Goal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Goals Display Component
function GoalsDisplay() {
  const { goals, activeGoals, updateGoal, deleteGoal } = useGoals();

  if (activeGoals.length === 0) return null;

  return (
    <GlassCard className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Active Goals
        </h3>
      </div>
      <div className="space-y-3">
        {activeGoals.map((goal) => (
          <div key={goal.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{goal.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {goal.goalType}
                </span>
                {goal.targetDate && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(goal.targetDate), "MMM d, yyyy")}
                  </span>
                )}
                {goal.targetValue && (
                  <span className="text-xs text-muted-foreground">
                    Target: {goal.targetValue}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => updateGoal({ id: goal.id, completed: true })}
                className="text-green-400 hover:text-green-300"
              >
                <CheckCircle2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteGoal(goal.id)}
                className="text-muted-foreground hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// Export Chart Function
function ExportableChart({ chartRef, title }: { chartRef: React.RefObject<HTMLDivElement>; title: string }) {
  const handleExport = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleExport} className="text-muted-foreground">
      <Download className="w-4 h-4" />
    </Button>
  );
}

export default function Tracking() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: checkins, isLoading: checkinsLoading } = useCheckins();
  const monthlyChartRef = useRef<HTMLDivElement>(null);
  const { data: completions, isLoading: exercisesLoading } = useExerciseCompletions();
  const { data: profile } = useQuery<UserProfile | null>({ queryKey: ["/api/profile"] });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const sortedCheckins = useMemo(
    () => [...(checkins || [])].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()),
    [checkins]
  );
  const latestCheckin = sortedCheckins[0];
  const allCompletions = completions || [];

  const moodGoal = profile?.moodGoal ?? 7;
  const sleepGoal = profile?.sleepGoal ?? 8;
  const stressGoal = profile?.stressGoal ?? 3;

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (!user) return <Redirect to="/" />;

  const loading = checkinsLoading || exercisesLoading;

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  const selectedIsToday = isToday(selectedDate);
  
  // Compare dates using UTC date portion to avoid timezone issues
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedCheckin = sortedCheckins.find((c) => 
    c.createdAt!.toString().split('T')[0] === selectedDateKey
  );
  const selectedDayCompletions = getExercisesForDay(allCompletions, selectedDate);
  const selectedDayExercises = getUniqueExerciseTypes(selectedDayCompletions);
  const selectedDayScore = getDayScore(selectedDayCompletions);
  const monthStart = startOfMonth(new Date());
  const isAtStart = isSameDay(selectedDate, monthStart);
  const isAtEnd = selectedIsToday;

  const exercisePercent = (selectedDayScore / EXERCISE_TYPES.length) * 100;
  const moodPercent = selectedCheckin ? Math.min(100, (selectedCheckin.moodScore / moodGoal) * 100) : 0;
  const sleepPercent = selectedCheckin ? Math.min(100, (selectedCheckin.sleepHours / sleepGoal) * 100) : 0;
  const stressPercent = selectedCheckin
    ? (selectedCheckin.stressLevel <= stressGoal ? 100 : Math.max(0, ((stressGoal - Math.max(0, selectedCheckin.stressLevel - stressGoal)) / stressGoal) * 100))
    : 0;

  const componentsCount = 4;
  const dayPercent = Math.round((exercisePercent + moodPercent + sleepPercent + stressPercent) / componentsCount);

  const dateLabel = selectedIsToday ? "Today" : format(selectedDate, "MMM d");

  return (
    <div className="min-h-full bg-background bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-semibold mb-2 text-white leading-tight">
              Your{" "}
              <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>Tracking</span>
            </h1>
            <p className="text-[#a0a0b4] text-lg">
              Stats, progress, and AI-powered insights at a glance.
            </p>
          </div>
          <GoalSettingDialog />
        </div>

        <div className="mb-4 flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            disabled={isAtStart}
            data-testid="button-date-prev"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <button
            className="text-white font-medium text-sm min-w-[180px] text-center"
            onClick={() => setSelectedDate(new Date())}
            data-testid="button-date-today"
          >
            {selectedIsToday ? "Today" : format(selectedDate, "EEEE, MMM d, yyyy")}
          </button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            disabled={isAtEnd}
            data-testid="button-date-next"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-8">
          {selectedCheckin ? (
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20" data-testid="checkin-status-done">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {selectedIsToday ? "Today's Check-in Done" : "Check-in Recorded"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mood {selectedCheckin.moodScore}/10 &middot; Sleep {selectedCheckin.sleepHours}h &middot; Stress {selectedCheckin.stressLevel}/10
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]" data-testid="checkin-status-pending">
              <div className="flex items-center gap-3">
                <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {selectedIsToday ? "No check-in yet today" : `No check-in for ${format(selectedDate, "MMM d")}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedIsToday ? "Log your mood, sleep, and stress to track progress" : "Add a check-in for this day"}
                  </p>
                </div>
              </div>
              <CheckinDialog forDate={selectedDate} />
            </div>
          )}

          {selectedDayExercises.length > 0 && (
            <div className="mt-3 px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <p className="text-xs text-muted-foreground mb-2">Exercises completed</p>
              <div className="flex flex-wrap gap-2">
                {selectedDayExercises.map((type) => (
                  <span key={type} className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium capitalize">
                    {type.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <GlassCard className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-2 text-center" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
            {selectedIsToday ? "Today's Goals" : `Goals for ${format(selectedDate, "MMM d")}`}
          </h3>
          <p className="text-xs text-[#6b6b80] text-center mb-6">
            {selectedCheckin ? "Check-in values vs daily targets" : "No check-in recorded — values show as zero"}
          </p>

          <div className="flex items-center justify-center mb-4">
            <div className="relative w-[130px] h-[130px]" data-testid="stat-overall-progress">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={dayPercent >= 80 ? "#22c55e" : dayPercent >= 50 ? "#9b6dff" : "#ef4444"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - dayPercent / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{dayPercent}%</span>
                <span className="text-[10px] text-[#6b6b80]">overall</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mb-6">
            {selectedCheckin ? (
              <div
                className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"
                data-testid="button-checkin-done-goals"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            ) : (
              <CheckinDialog
                forDate={selectedDate}
                trigger={
                  <button
                    className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary transition-all hover:bg-primary/30"
                    data-testid="button-add-checkin-goals"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                }
              />
            )}
          </div>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            <ProgressRing
              value={selectedCheckin?.moodScore ?? null}
              goal={moodGoal}
              color="#9b6dff"
              label="Mood"
              icon={Smile}
              suffix="/10"
            />
            <ProgressRing
              value={selectedCheckin?.sleepHours ?? null}
              goal={sleepGoal}
              color="#6dc8ff"
              label="Sleep"
              icon={BedDouble}
              suffix="h"
            />
            <ProgressRing
              value={selectedCheckin?.stressLevel ?? null}
              goal={stressGoal}
              color="#ff6d8a"
              label="Stress"
              icon={Gauge}
              suffix="/10"
              invert
            />
            <ProgressRing
              value={selectedDayScore}
              goal={EXERCISE_TYPES.length}
              color="#22c55e"
              label="Exercises"
              icon={Dumbbell}
            />
          </div>
        </GlassCard>

        {/* Active Goals */}
        <GoalsDisplay />

        {/* Week over Week Comparison */}
        <WeekComparison checkins={sortedCheckins} />

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">Monthly Overview</h3>
            <ExportableChart chartRef={monthlyChartRef} title="Monthly Overview" />
          </div>
          <div ref={monthlyChartRef}>
            <MonthlyOverview checkins={sortedCheckins} />
          </div>
        </div>

        {/* Sleep-Mood Correlation */}
        <SleepMoodCorrelation checkins={sortedCheckins} />

        <AIInsight latestCheckin={latestCheckin} exerciseCompletions={allCompletions} />
      </main>
    </div>
  );
}
