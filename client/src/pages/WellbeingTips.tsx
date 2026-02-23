import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Sun, Moon, Brain, Heart, Droplets, Leaf } from "lucide-react";

const tips = [
  { icon: Sun, title: "Start your day with intention", description: "Before reaching for your phone, take three deep breaths and set a simple intention for the day. This small practice creates a buffer between sleep and the demands of the day." },
  { icon: Moon, title: "Wind down without screens", description: "Try to spend the last 30 minutes before bed without any screens. Read a physical book, journal, or practise gentle stretching. Your brain needs time to transition into sleep mode." },
  { icon: Brain, title: "Name what you feel", description: "When emotions feel overwhelming, try to name them specifically. Instead of 'I feel bad,' try 'I feel anxious about tomorrow's presentation.' Naming emotions reduces their intensity." },
  { icon: Heart, title: "Move your body gently", description: "You don't need an intense workout to feel better. A 10-minute walk, some light stretching, or even dancing to your favourite song can shift your mood significantly." },
  { icon: Droplets, title: "Stay hydrated", description: "Dehydration can increase anxiety and decrease concentration. Keep a water bottle nearby and aim for at least 8 glasses throughout the day. Your brain is 75% water." },
  { icon: Leaf, title: "Spend time in nature", description: "Even 20 minutes in a green space can lower cortisol levels and boost your mood. If you can't get outside, looking at natural scenes or keeping plants nearby helps too." },
];

export default function WellbeingTips() {
  return (
    <InfoPageLayout>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            Wellbeing{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              Tips
            </span>
          </h1>
          <p className="text-[15px] text-[#6b6b80] max-w-[480px] mx-auto">
            Simple, science-backed practices you can weave into your daily routine to support your mental wellness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
          {tips.map((tip) => (
            <div key={tip.title} className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-7 flex gap-5" data-testid={`card-tip-${tip.title.toLowerCase().replace(/\s+/g, '-').slice(0, 25)}`}>
              <div className="w-11 h-11 rounded-xl bg-[#9b6dff]/10 border border-[#9b6dff]/20 flex items-center justify-center flex-shrink-0">
                <tip.icon className="w-5 h-5 text-[#9b6dff]" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold mb-2">{tip.title}</h3>
                <p className="text-[13px] text-[#6b6b80] leading-[1.7]">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
}
