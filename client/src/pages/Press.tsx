import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { ExternalLink } from "lucide-react";

const pressItems = [
  { outlet: "TechCrunch", date: "Jan 2026", title: "FocusMind raises seed round to bring AI-powered wellness to everyone", excerpt: "The mental wellness startup is using AI to help users understand their emotional patterns and build healthier daily habits." },
  { outlet: "The Verge", date: "Dec 2025", title: "The best mental wellness apps of 2025", excerpt: "FocusMind stands out with its thoughtful combination of mood tracking, AI insights, and grounding exercises." },
  { outlet: "Wired", date: "Nov 2025", title: "How AI is changing the way we think about mental health", excerpt: "Apps like FocusMind are leading a new wave of tools that use AI to provide personalised mental wellness support." },
];

export default function Press() {
  return (
    <InfoPageLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            Press &{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              Media
            </span>
          </h1>
          <p className="text-[15px] text-[#6b6b80] leading-[1.7]">
            FocusMind in the news. For press enquiries, please contact{" "}
            <a href="mailto:press@focusmind.app" className="text-[#9b6dff]">press@focusmind.app</a>.
          </p>
        </div>

        <div className="space-y-4">
          {pressItems.map((item) => (
            <article key={item.title} className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-7" data-testid={`card-press-${item.outlet.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="text-[13px] font-semibold text-[#9b6dff]">{item.outlet}</span>
                <span className="text-[12px] text-[#6b6b80]">{item.date}</span>
              </div>
              <h3 className="text-[16px] font-semibold mb-2 leading-[1.4]">{item.title}</h3>
              <p className="text-[13px] text-[#6b6b80] leading-[1.7] mb-3">{item.excerpt}</p>
              <a href="#" className="inline-flex items-center gap-1.5 text-[13px] text-[#9b6dff] font-medium">
                Read article <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
}
