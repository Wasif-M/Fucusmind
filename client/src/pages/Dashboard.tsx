import { useState, useMemo } from "react";

import { useCheckins } from "@/hooks/use-checkins";
import { useExerciseCompletions } from "@/hooks/use-exercises";
import { useProfile } from "@/hooks/use-profile";
import { CheckinDialog } from "@/components/checkin-dialog";
import { MoodChart } from "@/components/charts/MoodChart";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, ArrowRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, isToday, startOfDay, isAfter } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { EXERCISE_TYPES } from "@shared/schema";
import type { ExerciseCompletion } from "@shared/schema";

const EXERCISE_LABELS: Record<string, string> = {
  breathing: "4-7-8 Breathing",
  grounding: "5-4-3-2-1",
  meditation: "Meditation",
  box_breathing: "Box Breathing",
  body_scan: "Body Scan",
  gratitude: "Gratitude",
  nature: "Nature",
  pmr: "Muscle Relaxation",
  butterfly_hug: "Butterfly Hug",
};

function getExercisesForDay(completions: ExerciseCompletion[], day: Date) {
  const dayStart = startOfDay(day);
  return completions.filter((c) => {
    const cDate = startOfDay(new Date(c.completedAt!));
    return isSameDay(cDate, dayStart);
  });
}

function getUniqueExerciseTypes(dayCompletions: ExerciseCompletion[]): string[] {
  return Array.from(new Set(dayCompletions.map((c) => c.exerciseType)));
}

function getDayScore(dayCompletions: ExerciseCompletion[]): number {
  const uniqueTypes = getUniqueExerciseTypes(dayCompletions);
  return uniqueTypes.length;
}

function getScoreColor(score: number): string {
  if (score === 0) return "";
  if (score <= 2) return "bg-primary/20 text-primary/80";
  if (score <= 4) return "bg-primary/35 text-primary";
  if (score <= 6) return "bg-primary/55 text-white/90";
  return "bg-primary/80 text-white";
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { profile } = useProfile();
  const { data: checkins, isLoading: checkinsLoading } = useCheckins();
  const { data: completions, isLoading: exercisesLoading } = useExerciseCompletions();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const currentMonth = new Date();

  const sortedCheckins = useMemo(() =>
    [...(checkins || [])].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()),
    [checkins]
  );
  const allCompletions = completions || [];

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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const selectedDayCompletions = selectedDay ? getExercisesForDay(allCompletions, selectedDay) : [];
  const selectedDayScore = getDayScore(selectedDayCompletions);
  const selectedDayTypes = getUniqueExerciseTypes(selectedDayCompletions);
  const selectedDayCheckins = selectedDay ? sortedCheckins.filter((c) => isSameDay(new Date(c.createdAt!), selectedDay)) : [];

  return (
    <div className="min-h-full bg-background bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <p className="text-lg text-[#a0a0b4] mb-1">
              Welcome back,{" "}
              <span className="text-[#c9a6ff] font-medium">
                {profile?.displayName || user?.firstName || user?.email?.split("@")[0] || "User"}
              </span>
            </p>
            <h1 className="text-4xl font-semibold mb-2 text-white leading-tight">
              Your{" "}
              <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>Dashboard</span>
            </h1>
            <p className="text-[#a0a0b4] text-lg">
              Track your wellness journey, one day at a time.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <CheckinDialog />
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3">
            <GlassCard className="h-full">
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="w-9 h-9" />
                <h3 className="text-lg font-semibold text-white">{format(currentMonth, "MMMM yyyy")}</h3>
                <div className="w-9 h-9" />
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {daysInMonth.map((day) => {
                  const isFuture = isAfter(startOfDay(day), startOfDay(new Date()));
                  const dayCompletions = getExercisesForDay(allCompletions, day);
                  const score = getDayScore(dayCompletions);
                  const hasCheckin = sortedCheckins.some((c) => isSameDay(new Date(c.createdAt!), day));
                  const hasActivity = score > 0 || hasCheckin;
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  const today = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                      disabled={isFuture}
                      onClick={() => !isFuture && setSelectedDay(isSelected ? null : day)}
                      className={`
                        aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all relative
                        ${isFuture ? "text-muted-foreground/30 cursor-default" : ""}
                        ${!isFuture && isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}
                        ${!isFuture && hasActivity ? getScoreColor(score) : ""}
                        ${!isFuture && !hasActivity ? "text-muted-foreground hover:bg-white/5" : ""}
                        ${today ? "font-bold" : ""}
                      `}
                    >
                      <span className="leading-none">{format(day, "d")}</span>
                      {score === EXERCISE_TYPES.length && (
                        <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                      {hasCheckin && score < EXERCISE_TYPES.length && (
                        <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary/60" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <div className="w-3 h-3 rounded bg-primary/20" /> 1-2
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <div className="w-3 h-3 rounded bg-primary/35" /> 3-4
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <div className="w-3 h-3 rounded bg-primary/55" /> 5-6
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <div className="w-3 h-3 rounded bg-primary/80" /> All 7
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> Perfect day
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-2">
            {selectedDay ? (
              <GlassCard gradient className="h-full">
                <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">
                  {format(selectedDay, "EEEE")}
                </p>
                <h3 className="text-lg font-semibold text-white mb-1">{format(selectedDay, "MMMM d, yyyy")}</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  {selectedDayScore}/{EXERCISE_TYPES.length} exercises completed
                </p>

                <div className="space-y-2 mb-5">
                  {EXERCISE_TYPES.map((type) => {
                    const done = selectedDayTypes.includes(type);
                    return (
                      <div key={type} className={`flex items-center gap-3 p-2.5 rounded-xl ${done ? "bg-primary/10" : "bg-white/5"}`} data-testid={`exercise-status-${type}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-primary/30 text-primary" : "bg-white/10 text-muted-foreground"}`}>
                          {done ? (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
                          )}
                        </div>
                        <span className={`text-sm ${done ? "text-white" : "text-muted-foreground"}`}>{EXERCISE_LABELS[type]}</span>
                      </div>
                    );
                  })}
                </div>

                {selectedDayCheckins.length > 0 && (
                  <div className="border-t border-white/5 pt-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Check-in</p>
                    {selectedDayCheckins.map((c) => (
                      <div key={c.id} className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Mood </span>
                          <span className="font-mono font-medium text-white">{c.moodScore}/10</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sleep </span>
                          <span className="font-mono font-medium text-white">{c.sleepHours}h</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Stress </span>
                          <span className="font-mono font-medium text-white">{c.stressLevel}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedDayScore === 0 && selectedDayCheckins.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No activity this day.</p>
                  </div>
                )}
              </GlassCard>
            ) : (
              <GlassCard gradient className="h-full flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Calendar</p>
                  <h3 className="text-lg font-display font-medium text-white mb-2">Select a day</h3>
                  <p className="text-sm text-muted-foreground">
                    Tap any day on the calendar to see which exercises you completed and your check-in data. Brighter days mean more exercises done.
                  </p>
                </div>
                <div className="mt-6">
                  <Link href="/tools" data-testid="link-go-to-tools">
                    <Button variant="outline" className="w-full rounded-full">
                      Start an exercise <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        <MoodChart data={checkins || []} />
      </main>
    </div>
  );
}
