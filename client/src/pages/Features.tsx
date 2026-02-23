import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Brain, BarChart3, Wind, Sparkles, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Our AI understands your emotional patterns and provides personalised insights based on your daily check-ins. It learns what triggers your stress and helps you stay balanced."
  },
  {
    icon: BarChart3,
    title: "Clarity Insights",
    description: "Visual trends that show where your mind has been and where it's heading. Easy-to-read charts help you spot growth and understand yourself better over time."
  },
  {
    icon: Wind,
    title: "Grounding Tools",
    description: "Quick, gentle techniques to calm your nervous system. From 4-7-8 breathing exercises to the 5-4-3-2-1 senses technique and guided meditation timers."
  },
  {
    icon: Sparkles,
    title: "Daily Check-Ins",
    description: "Track your mood, sleep quality, and stress levels with simple daily check-ins. Add notes to capture what's on your mind and build awareness over time."
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your wellness data is encrypted and stored securely. We never share your personal information with third parties. Your mental health journey stays yours."
  },
  {
    icon: Clock,
    title: "Progress Over Time",
    description: "See how your wellness metrics evolve week by week. Our history journal lets you look back, reflect, and celebrate the small wins along the way."
  }
];

export default function Features() {
  return (
    <InfoPageLayout>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            Everything you need to feel{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              more balanced
            </span>
          </h1>
          <p className="text-[15px] text-[#6b6b80] max-w-[520px] mx-auto leading-[1.7]">
            FocusMind combines AI insights, grounding exercises, and data visualisation to support your mental wellness journey every day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-8"
              data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#9b6dff]/10 border border-[#9b6dff]/20 flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-[#9b6dff]" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-[13px] text-[#6b6b80] leading-[1.7]">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <a
            href="/api/login"
            className="inline-flex items-center px-7 py-3 rounded-full text-sm font-medium text-white transition-all"
            style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }}
            data-testid="link-features-cta"
          >
            Start Your Free Trial
          </a>
        </div>
      </div>
    </InfoPageLayout>
  );
}
