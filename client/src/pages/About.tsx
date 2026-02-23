import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Heart, Target, Users } from "lucide-react";

export default function About() {
  return (
    <InfoPageLayout>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-[720px] mb-20">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-6">
            Built for people who want to feel{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              steadier
            </span>
          </h1>
          <p className="text-[15px] text-[#a0a0b4] leading-[1.8]">
            FocusMind was born from a simple observation: most people know they should take care of their mental health, but they don't know where to start. We built a tool that meets you where you are, adapts to how you feel, and helps you build small, sustainable habits that actually stick.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Heart, title: "Our Mission", description: "To make mental wellness accessible, personal, and sustainable. We believe that small, daily steps lead to lasting change." },
            { icon: Target, title: "Our Approach", description: "We combine science-backed techniques with AI to create personalised wellness plans that adapt to your unique emotional patterns." },
            { icon: Users, title: "Our Community", description: "Over 10,000 people use FocusMind daily. We're building a community that supports each other on the journey to better mental health." },
          ].map((item) => (
            <div key={item.title} className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-8" data-testid={`card-about-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <item.icon className="w-8 h-8 text-[#9b6dff] mb-5" />
              <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
              <p className="text-[13px] text-[#6b6b80] leading-[1.7]">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.08] pt-16">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <p className="text-[14px] text-[#a0a0b4] leading-[1.8]">
              We started FocusMind in 2024 after noticing a gap in how people approach mental wellness. Most apps either feel clinical or are too vague to be useful. We wanted to create something that feels like a thoughtful companion -- something that listens, learns, and gently guides you toward feeling better.
            </p>
            <p className="text-[14px] text-[#a0a0b4] leading-[1.8]">
              Today, FocusMind is used by thousands of people across the world. From students managing exam stress to professionals navigating burnout, our users have found that even a few minutes of daily check-ins and grounding exercises can transform how they feel throughout the day.
            </p>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}
