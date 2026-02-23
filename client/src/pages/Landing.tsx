import { useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function FocusMindLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="landingLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a6ff" />
          <stop offset="100%" stopColor="#9b6dff" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="50" cy="50" r="44" stroke="url(#landingLogoGradient)" strokeWidth="5" fill="none" />
      {/* Lotus petals */}
      <path d="M50 16 C44 28 40 36 50 44 C60 36 56 28 50 16Z" fill="url(#landingLogoGradient)" />
      <path d="M33 26 C29 38 33 46 45 46 C45 38 39 30 33 26Z" fill="url(#landingLogoGradient)" opacity="0.9" />
      <path d="M67 26 C71 38 67 46 55 46 C55 38 61 30 67 26Z" fill="url(#landingLogoGradient)" opacity="0.9" />
      {/* Curved hands/waves */}
      <path d="M20 50 Q30 56 40 50 Q32 60 20 56" fill="url(#landingLogoGradient)" opacity="0.8" />
      <path d="M80 50 Q70 56 60 50 Q68 60 80 56" fill="url(#landingLogoGradient)" opacity="0.8" />
      {/* Water droplet */}
      <path d="M50 50 C50 50 40 62 40 72 C40 79 44.5 84 50 84 C55.5 84 60 79 60 72 C60 62 50 50 50 50Z" fill="url(#landingLogoGradient)" />
    </svg>
  );
}

export default function Landing() {
  const fadeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      },
      { threshold: 0.1 }
    );
    fadeRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  const addFadeRef = (el: HTMLDivElement | null) => {
    if (el && !fadeRefs.current.includes(el)) {
      fadeRefs.current.push(el);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[100svh] flex items-center md:items-end overflow-hidden px-5 md:px-6 pt-24 pb-12 md:pt-[120px] md:pb-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.png"
            alt="Serene meditation in flower field"
            className="w-full h-full object-cover object-top md:object-center"
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, rgba(10,10,15,0.4) 0%, rgba(10,10,15,0.6) 30%, rgba(10,10,15,0.88) 60%, rgba(10,10,15,1) 100%)"
          }} />
        </div>

        <div className="relative z-10 max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-end">
          <div>
            <h1 className="text-[clamp(32px,7vw,64px)] font-semibold leading-[1.15] mb-3 md:mb-4">
              Train your focus.<br />
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
                Reclaim your mind.
              </span>
            </h1>
            <p className="text-[14px] md:text-[15px] text-[#a0a0b4] mb-6 md:mb-7 max-w-[400px]">
              Science-based tools to sharpen attention and build mental clarity.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="/signup"
                data-testid="link-get-started"
                className="inline-flex items-center gap-2 px-6 md:px-7 py-3 rounded-full text-sm font-medium bg-[#9b6dff] text-white transition-all hover:bg-[#6b3fa0] hover:-translate-y-0.5"
              >
                Go Deeper
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-16 md:py-24 border-b border-white/[0.08]" ref={addFadeRef}
        style={{ transition: "opacity 0.8s ease, transform 0.8s ease" }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-6">
          <div className="mb-12 flex items-center gap-3 text-[17px] font-bold text-[#c9a6ff]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <FocusMindLogo size={32} />
            <span>FocusMind</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-[60px] items-start">
            <h2 className="text-[clamp(22px,2.5vw,30px)] font-normal leading-[1.6] text-[#a0a0b4]">
              <strong className="text-white font-semibold">Your day changes.</strong> FocusMind analyses your stress patterns, sleep, and emotional cues to adjust your activities on the fly. Just small steps that make sense for how you feel today.
            </h2>
            <div className="relative pt-5">
              <div className="absolute top-0 left-0 right-0 h-px" style={{
                background: "linear-gradient(to right, rgba(255,255,255,0.08), transparent)"
              }} />
              <p className="text-sm leading-[1.8] text-[#6b6b80]">
                Start practicing exercises that suit today's mood, track micro-habits, guided by your current state, access insights aligned around your patterns, and gentle reflections that help you notice how you're really doing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-14 md:py-20 border-b border-white/[0.08]" ref={addFadeRef}
        style={{ transition: "opacity 0.8s ease, transform 0.8s ease" }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              { value: "10K", label: "People using our calming tools daily" },
              { value: "82%", label: "Users feel reduced stress within a week" },
              { value: "67%", label: "Build consistent routines in their first month" },
            ].map((stat, i) => (
              <div key={i} className={`py-8 text-center ${i < 2 ? "md:border-r md:border-white/[0.08]" : ""} ${i > 0 ? "border-t md:border-t-0 border-white/[0.08]" : ""}`}>
                <h3
                  className="text-[clamp(48px,5vw,72px)] font-light tracking-[-2px] mb-2"
                  style={{
                    background: "linear-gradient(180deg, #fff 40%, #6b6b80 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                  data-testid={`stat-value-${i}`}
                >
                  {stat.value}
                </h3>
                <p className="text-[13px] text-[#6b6b80] max-w-[220px] mx-auto">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24" ref={addFadeRef}
        style={{ transition: "opacity 0.8s ease, transform 0.8s ease" }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-[clamp(24px,3vw,40px)] font-semibold mb-3">Stay aligned with how you feel today</h2>
            <p className="text-[14px] md:text-[15px] text-[#6b6b80]">Our plan shifts gently with your mood to help you keep steady and clear.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {/* AI Analysis Card */}
            <div className="relative rounded-[16px] md:rounded-[20px] overflow-hidden transition-all hover:-translate-y-1 group" style={{ boxShadow: "0 8px 40px rgba(155,109,255,0.15)" }}>
              <img src="/images/feature-bg-1.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
              <div className="relative z-10 p-5 pt-6 flex flex-col h-full">
                <div className="rounded-[14px] p-5 mb-auto" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)" }}>
                  <p className="text-[13px] font-semibold text-[#1a1a2e] mb-3">Why do I feel overwhelmed so often lately?</p>
                  <div className="flex items-start gap-2.5 mb-4">
                    <div className="w-6 h-6 rounded-full bg-[#9b6dff] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-[11px] text-[#4a4a5a] leading-[1.6]">Based on your recent check-ins, sleep logs, and activity patterns, your stress levels have been el...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9b6dff] text-white rounded-full text-[11px] font-medium">View insight</span>
                    <span className="w-7 h-7 rounded-full bg-[#9b6dff]/10 border border-[#9b6dff]/30 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9b6dff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    </span>
                  </div>
                </div>
                <div className="mt-6 pb-2">
                  <h4 className="text-[22px] font-medium mb-2.5 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                    AI Analysis
                  </h4>
                  <p className="text-[13px] text-[#a0a0b4] leading-[1.7]">
                    Your plan shifts with your emotional state, helping you stay balanced without pushing routines that don't match your energy.
                  </p>
                </div>
              </div>
            </div>

            {/* Clarity Insights Card */}
            <div className="relative rounded-[16px] md:rounded-[20px] overflow-hidden transition-all hover:-translate-y-1 group" style={{ boxShadow: "0 8px 40px rgba(155,109,255,0.15)" }}>
              <img src="/images/feature-bg-2.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
              <div className="relative z-10 p-5 pt-6 flex flex-col h-full">
                <div className="rounded-[14px] p-5 mb-auto" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)" }}>
                  <div className="flex justify-between mb-3 text-[11px] text-[#6b6b80] font-medium px-1">
                    <span>25%</span><span>75%</span><span>36%</span><span>52%</span>
                  </div>
                  <div className="flex justify-between items-end h-[130px] gap-3 px-1">
                    {[25, 75, 36, 52].map((h, i) => (
                      <div key={i} className="flex-1 rounded-md" style={{
                        height: `${h}%`,
                        background: `linear-gradient(180deg, rgba(155,109,255,0.5) 0%, rgba(155,109,255,0.25) 100%)`,
                        minHeight: "12px",
                        border: "1px solid rgba(155,109,255,0.2)"
                      }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 text-[11px] text-[#6b6b80] font-medium px-1">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
                  </div>
                </div>
                <div className="mt-6 pb-2">
                  <h4 className="text-[22px] font-medium mb-2.5 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                    Clarity Insights
                  </h4>
                  <p className="text-[13px] text-[#a0a0b4] leading-[1.7]">
                    Simple, meaningful visuals reveal patterns in your sleep and habits so you can understand what supports your wellbeing.
                  </p>
                </div>
              </div>
            </div>

            {/* Grounding Tools Card */}
            <div className="relative rounded-[16px] md:rounded-[20px] overflow-hidden transition-all hover:-translate-y-1 group" style={{ boxShadow: "0 8px 40px rgba(155,109,255,0.15)" }}>
              <img src="/images/feature-bg-3.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
              <div className="relative z-10 p-5 pt-6 flex flex-col h-full">
                <div className="rounded-[14px] p-4 mb-auto space-y-3" style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)" }}>
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#9b6dff]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#9b6dff"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-[#1a1a2e]">Emotional Support</p>
                      <p className="text-[10px] text-[#6b6b80] leading-[1.5] mt-0.5">Label feeling, check intensity, reflect briefly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#e8a87c]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#e8a87c"><path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 16.96 19.32C18.73 17.65 19.38 15.11 18.43 12.85L18.3 12.58C18.1 12.2 17.83 11.88 17.66 11.2Z"/></svg>
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-[#1a1a2e]">Body Soothers</p>
                      <p className="text-[10px] text-[#6b6b80] leading-[1.5] mt-0.5">Stretch release, posture reset, warm-hold touch</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#88c9a1]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#88c9a1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold text-[#1a1a2e]">Calm Rituals</p>
                      <p className="text-[10px] text-[#6b6b80] leading-[1.5] mt-0.5">Slow breathing, gentle stretching, meditation</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pb-2">
                  <h4 className="text-[22px] font-medium mb-2.5 text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                    Grounding Tools
                  </h4>
                  <p className="text-[13px] text-[#a0a0b4] leading-[1.7]">
                    Short practices crafted to stabilise your nervous system and help you return to a calmer, more centred state of mind.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-10 border-t border-b border-white/[0.08] overflow-hidden">
        <div className="flex w-max animate-[marquee_30s_linear_infinite]">
          {[0, 1].map((group) => (
            <div key={group} className="flex items-center gap-10 pr-10 whitespace-nowrap">
              {["Grounding Tools", "Clarity Insights", "AI Emotional Analysis", "Your day changes"].map((text, i) => (
                <span key={`${group}-${i}`} className="flex items-center gap-10">
                  <span className="text-[clamp(20px,2.5vw,28px)] text-[#a0a0b4]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>
                    {text}
                  </span>
                  <span className="w-2 h-2 bg-[#9b6dff] rounded-full inline-block flex-shrink-0" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24" ref={addFadeRef}
        style={{ transition: "opacity 0.8s ease, transform 0.8s ease" }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-6">
          <div className="rounded-[20px] md:rounded-[28px] overflow-hidden relative min-h-[340px] md:min-h-[400px] flex items-end" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <img src="/images/cta-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{
              background: "linear-gradient(160deg, rgba(10,10,15,0.75) 0%, rgba(10,10,15,0.4) 40%, rgba(10,10,15,0.25) 70%, rgba(10,10,15,0.5) 100%)"
            }} />
            <div className="relative z-10 w-full flex flex-col lg:flex-row lg:justify-between gap-6 p-6 md:p-10 lg:p-[50px]">
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-[clamp(28px,4vw,44px)] font-semibold leading-[1.15] mb-3">
                    Ready to feel<br />
                    <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
                      more balanced?
                    </span>
                  </h2>
                  <p className="text-[13px] text-white/60 leading-[1.7] mb-6 max-w-[340px]">
                    Start building a calmer, steadier routine with tools that adapt to your emotional rhythm.
                  </p>
                  <a
                    href="/signup"
                    data-testid="link-cta-get-started"
                    className="inline-flex items-center gap-2 pl-6 pr-1.5 py-1.5 rounded-full text-sm font-medium bg-white text-[#1a1a2e] transition-all duration-300 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] group/cta"
                  >
                    Get Started
                    <span className="w-8 h-8 rounded-full bg-[#9b6dff] flex items-center justify-center transition-all duration-300 group-hover/cta:bg-[#b08aff]">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                    </span>
                  </a>
                </div>
              </div>
              <div className="flex flex-col justify-end gap-2 self-end lg:self-auto lg:justify-end">
                <div className="flex items-center gap-2.5 rounded-full px-4 py-2" style={{ background: "rgba(15,15,20,0.65)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-[13px] font-semibold text-white/90" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>87%</span>
                  <span className="w-px h-4 bg-white/15" />
                  <span className="text-[12px] text-white/60">Feel calmer within a week</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-full px-4 py-2" style={{ background: "rgba(15,15,20,0.65)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <span className="text-[13px] font-semibold text-white/90" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}>9/10</span>
                  <span className="w-px h-4 bg-white/15" />
                  <span className="text-[12px] text-white/60">Manage stress better</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}