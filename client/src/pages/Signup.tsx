import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { getApiUrl } from "@/lib/api-url";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import {
  Loader2,
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Target,
  Brain,
  Moon,
  Dumbbell,
  Clock,
  Heart,
  Wind,
  Sparkles,
  Check,
  Smile,
  BedDouble,
  Gauge,
  Minus,
  Plus,
} from "lucide-react";

const GOALS = [
  { id: "reduce_stress", label: "Reduce Stress", icon: Brain },
  { id: "improve_sleep", label: "Better Sleep", icon: Moon },
  { id: "build_focus", label: "Build Focus", icon: Target },
  { id: "emotional_balance", label: "Emotional Balance", icon: Heart },
  { id: "daily_routine", label: "Daily Routine", icon: Clock },
  { id: "mindfulness", label: "Mindfulness", icon: Wind },
];

const STRESS_OPTIONS = [
  { id: "rarely", label: "Rarely" },
  { id: "sometimes", label: "Sometimes" },
  { id: "often", label: "Often" },
  { id: "daily", label: "Daily" },
];

const SLEEP_OPTIONS = [
  { id: "great", label: "Great" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
  { id: "poor", label: "Poor" },
];

const EXPERIENCE_OPTIONS = [
  { id: "beginner", label: "New to this" },
  { id: "some", label: "Tried a few" },
  { id: "regular", label: "Regular practice" },
  { id: "experienced", label: "Experienced" },
];

const TIME_OPTIONS = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "anytime", label: "Anytime" },
];

const FOCUS_AREAS = [
  { id: "breathing", label: "Breathing", icon: Wind },
  { id: "meditation", label: "Meditation", icon: Sparkles },
  { id: "body_scan", label: "Body Scan", icon: Dumbbell },
  { id: "gratitude", label: "Gratitude", icon: Heart },
  { id: "grounding", label: "Grounding", icon: Target },
  { id: "visualization", label: "Visualization", icon: Brain },
];

export default function Signup() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = (path: string) => {
    setIsNavigating(true);
    setTimeout(() => setLocation(path), 300);
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [primaryGoal, setPrimaryGoal] = useState("");
  const [stressFrequency, setStressFrequency] = useState("");
  const [sleepQuality, setSleepQuality] = useState("");
  const [exerciseExperience, setExerciseExperience] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [age, setAge] = useState("");
  const [moodGoal, setMoodGoal] = useState(7);
  const [sleepGoal, setSleepGoal] = useState(8);
  const [stressGoal, setStressGoal] = useState(3);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user) return <Redirect to="/chat" />;

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const toggleFocusArea = (id: string) => {
    setFocusAreas((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const suggestGoals = (stress: string, sleep: string) => {
    const moodMap: Record<string, number> = { rarely: 8, sometimes: 7, often: 6, daily: 5 };
    const sleepMap: Record<string, number> = { great: 9, good: 8, fair: 7, poor: 6 };
    const stressMap: Record<string, number> = { rarely: 2, sometimes: 3, often: 4, daily: 5 };
    if (stress) setStressGoal(stressMap[stress] ?? 3);
    if (stress) setMoodGoal(moodMap[stress] ?? 7);
    if (sleep) setSleepGoal(sleepMap[sleep] ?? 8);
  };

  const validateStep0 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "At least 6 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!primaryGoal) errs.primaryGoal = "Select a goal";
    if (!stressFrequency) errs.stressFrequency = "Select an option";
    if (!sleepQuality) errs.sleepQuality = "Select an option";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (step === 0 && validateStep0()) setStep(1);
    else if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    if (step !== 2) return;
    const errs: Record<string, string> = {};
    if (!primaryGoal) errs.primaryGoal = "Select a goal";
    if (!stressFrequency) errs.stressFrequency = "Select an option";
    if (!sleepQuality) errs.sleepQuality = "Select an option";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          displayName: name,
          primaryGoal: primaryGoal || undefined,
          stressFrequency: stressFrequency || undefined,
          sleepQuality: sleepQuality || undefined,
          exerciseExperience: exerciseExperience || undefined,
          preferredTime: preferredTime || undefined,
          focusAreas: focusAreas.length ? focusAreas : undefined,
          age: age ? parseInt(age, 10) : undefined,
          moodGoal,
          sleepGoal,
          stressGoal,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ form: data.message || "Signup failed" });
        setIsSubmitting(false);
        return;
      }
      window.location.href = data.redirect || "/chat";
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
      setIsSubmitting(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center gap-2 mb-8 justify-center">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              i < step
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : i === step
                ? "bg-primary/20 text-primary border border-primary/40"
                : "bg-white/5 text-[#6b6b80] border border-white/10"
            }`}
          >
            {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
          </div>
          {i < 2 && (
            <div className={`w-12 h-px ${i < step ? "bg-green-500/30" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );

  const stepLabels = ["Create Account", "Your Wellness", "Preferences"];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ padding: "120px 24px 80px" }}>
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.png"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, rgba(10,10,15,0.6) 0%, rgba(10,10,15,0.85) 40%, rgba(10,10,15,0.95) 70%, rgba(10,10,15,1) 100%)"
          }} />
        </div>

        <div className="relative z-10 w-full max-w-[520px] mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-[clamp(28px,4vw,40px)] font-semibold leading-[1.2] mb-3">
              Begin your{" "}
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
                journey
              </span>
            </h1>
            <p className="text-[14px] text-[#a0a0b4]">
              {stepLabels[step]} — Step {step + 1} of 3
            </p>
          </div>

          {stepIndicator}

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            {step === 0 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </Label>
                  <Input
                    data-testid="input-signup-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl text-white placeholder:text-[#6b6b80]"
                  />
                  {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </Label>
                  <Input
                    data-testid="input-signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl text-white placeholder:text-[#6b6b80]"
                  />
                  {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Password
                  </Label>
                  <Input
                    data-testid="input-signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl text-white placeholder:text-[#6b6b80]"
                  />
                  {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Confirm Password
                  </Label>
                  <Input
                    data-testid="input-signup-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Type your password again"
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl text-white placeholder:text-[#6b6b80]"
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
                </div>

                <Button
                  data-testid="button-signup-next1"
                  onClick={nextStep}
                  className="w-full h-12 rounded-xl bg-[#9b6dff] hover:bg-[#6b3fa0] text-base font-medium mt-2"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-center text-xs text-[#6b6b80] mt-4">
                  Already have an account?{" "}
                  <button onClick={() => handleNavigate("/login")} className="text-[#9b6dff] hover:underline">
                    Sign in
                  </button>
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> What's your primary goal?
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g.id}
                        data-testid={`button-goal-${g.id}`}
                        onClick={() => setPrimaryGoal(g.id)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all border ${
                          primaryGoal === g.id
                            ? "bg-primary/15 border-primary/40 text-white"
                            : "bg-white/3 border-white/8 text-[#a0a0b4] hover:border-white/15"
                        }`}
                      >
                        <g.icon className="w-4 h-4 shrink-0" />
                        <span>{g.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.primaryGoal && <p className="text-xs text-red-400">{errors.primaryGoal}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm text-[#a0a0b4]">How often do you feel stressed?</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {STRESS_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        data-testid={`button-stress-${o.id}`}
                        onClick={() => { setStressFrequency(o.id); suggestGoals(o.id, sleepQuality); }}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-center transition-all border ${
                          stressFrequency === o.id
                            ? "bg-primary/15 border-primary/40 text-white"
                            : "bg-white/3 border-white/8 text-[#a0a0b4] hover:border-white/15"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {errors.stressFrequency && <p className="text-xs text-red-400">{errors.stressFrequency}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm text-[#a0a0b4]">How would you rate your sleep?</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {SLEEP_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        data-testid={`button-sleep-${o.id}`}
                        onClick={() => { setSleepQuality(o.id); suggestGoals(stressFrequency, o.id); }}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-center transition-all border ${
                          sleepQuality === o.id
                            ? "bg-primary/15 border-primary/40 text-white"
                            : "bg-white/3 border-white/8 text-[#a0a0b4] hover:border-white/15"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {errors.sleepQuality && <p className="text-xs text-red-400">{errors.sleepQuality}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-[#a0a0b4]">Your age (optional)</Label>
                  <Input
                    data-testid="input-signup-age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl text-white placeholder:text-[#6b6b80]"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> Your Daily Goals
                  </Label>
                  <p className="text-xs text-[#6b6b80]">We suggest goals based on your answers. Adjust as you like.</p>

                  {[
                    { label: "Mood", icon: Smile, value: moodGoal, set: setMoodGoal, min: 1, max: 10, color: "#9b6dff", suffix: "/10" },
                    { label: "Sleep", icon: BedDouble, value: sleepGoal, set: setSleepGoal, min: 4, max: 12, color: "#6dc8ff", suffix: "hrs" },
                    { label: "Stress", icon: Gauge, value: stressGoal, set: setStressGoal, min: 1, max: 10, color: "#ff6d8a", suffix: "/10", desc: "lower is better" },
                  ].map((g) => (
                    <div key={g.label} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
                      <g.icon className="w-4 h-4 shrink-0" style={{ color: g.color }} />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-white">{g.label}</span>
                        {g.desc && <span className="text-[10px] text-[#6b6b80] ml-1">({g.desc})</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          data-testid={`button-goal-dec-${g.label.toLowerCase()}`}
                          onClick={() => g.set(Math.max(g.min, g.value - 1))}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#a0a0b4]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-base font-semibold text-white w-12 text-center" data-testid={`text-goal-${g.label.toLowerCase()}`}>
                          {g.value}{g.suffix}
                        </span>
                        <button
                          type="button"
                          data-testid={`button-goal-inc-${g.label.toLowerCase()}`}
                          onClick={() => g.set(Math.min(g.max, g.value + 1))}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#a0a0b4]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    data-testid="button-signup-back1"
                    variant="outline"
                    onClick={() => setStep(0)}
                    className="flex-1 h-12 rounded-xl border-white/10 text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    data-testid="button-signup-next2"
                    onClick={nextStep}
                    className="flex-1 h-12 rounded-xl bg-[#9b6dff] hover:bg-[#6b3fa0] text-base font-medium"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {errors.form && <p className="text-sm text-red-400">{errors.form}</p>}
                <div className="space-y-3">
                  <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                    <Dumbbell className="w-3.5 h-3.5" /> Exercise experience
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERIENCE_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        data-testid={`button-exp-${o.id}`}
                        onClick={() => setExerciseExperience(o.id)}
                        className={`px-3 py-2.5 rounded-xl text-sm text-center transition-all border ${
                          exerciseExperience === o.id
                            ? "bg-primary/15 border-primary/40 text-white"
                            : "bg-white/3 border-white/8 text-[#a0a0b4] hover:border-white/15"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Preferred practice time
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        data-testid={`button-time-${o.id}`}
                        onClick={() => setPreferredTime(o.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-center transition-all border ${
                          preferredTime === o.id
                            ? "bg-primary/15 border-primary/40 text-white"
                            : "bg-white/3 border-white/8 text-[#a0a0b4] hover:border-white/15"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm text-[#a0a0b4]">Focus areas (select any)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {FOCUS_AREAS.map((a) => (
                      <button
                        key={a.id}
                        data-testid={`button-focus-${a.id}`}
                        onClick={() => toggleFocusArea(a.id)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all border ${
                          focusAreas.includes(a.id)
                            ? "bg-primary/15 border-primary/40 text-white"
                            : "bg-white/3 border-white/8 text-[#a0a0b4] hover:border-white/15"
                        }`}
                      >
                        <a.icon className="w-4 h-4 shrink-0" />
                        <span>{a.label}</span>
                        {focusAreas.includes(a.id) && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    data-testid="button-signup-back2"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-xl border-white/10 text-white"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    data-testid="button-signup-submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-[#9b6dff] hover:bg-[#6b3fa0] text-base font-medium"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                    ) : (
                      <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-[#6b6b80] mt-6">
            By signing up you agree to our{" "}
            <a href="/terms" className="text-[#9b6dff] hover:underline">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="text-[#9b6dff] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </section>

      {isNavigating && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0f]/90 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#9b6dff]" />
            <p className="text-sm text-[#a0a0b4]">Loading...</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
