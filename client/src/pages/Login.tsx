import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { getApiUrl } from "@/lib/api-url";
import { Redirect, useLocation } from "wouter";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = (path: string) => {
    setIsNavigating(true);
    setTimeout(() => setLocation(path), 300);
  };

  if (user) return <Redirect to="/chat" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        setIsSubmitting(false);
        return;
      }
      window.location.href = data.redirect || "/chat";
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ padding: "120px 24px 80px" }}>
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.png" alt="" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(10,10,15,0.6) 0%, rgba(10,10,15,0.85) 40%, rgba(10,10,15,0.95) 70%, rgba(10,10,15,1) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[420px] mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-[clamp(28px,4vw,40px)] font-semibold leading-[1.2] mb-3">
              Welcome back
            </h1>
            <p className="text-[14px] text-[#a0a0b4]">Sign in to continue to FocusMind</p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "32px",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="space-y-2">
                <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" /> Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl text-white placeholder:text-[#6b6b80]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#a0a0b4] flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> Password
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="bg-white/5 border-white/10 focus:border-primary/50 h-11 rounded-xl text-white placeholder:text-[#6b6b80]"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-[#9b6dff] hover:bg-[#6b3fa0] text-base font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-[#a0a0b4] mt-6">
              Don&apos;t have an account?{" "}
              <button onClick={() => handleNavigate("/signup")} className="text-[#9b6dff] hover:underline">
                Sign up
              </button>
            </p>

            {isNavigating && (
              <div className="fixed inset-0 z-50 bg-[#0a0a0f]/90 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#9b6dff]" />
                  <p className="text-sm text-[#a0a0b4]">Loading...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
