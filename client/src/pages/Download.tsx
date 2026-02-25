import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Monitor, Smartphone, Globe } from "lucide-react";

export default function Download() {
  return (
    <InfoPageLayout>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            Take FocusMind{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              everywhere
            </span>
          </h1>
          <p className="text-[15px] text-[#6b6b80] max-w-[480px] mx-auto">
            Access your wellness tools on any device. Your data syncs seamlessly across all platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[900px] mx-auto">
          {[
            { icon: Globe, title: "Web App", description: "Use FocusMind directly in your browser. No installation needed -- just sign in and start.", cta: "Open Web App", available: true },
            { icon: Smartphone, title: "Mobile App", description: "Take your wellness practice on the go with our native mobile experience. Available soon.", cta: "Coming Soon", available: false },
            { icon: Monitor, title: "Desktop App", description: "A dedicated desktop experience for deeper focus and distraction-free check-ins. Available soon.", cta: "Coming Soon", available: false },
          ].map((platform) => (
            <div key={platform.title} className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-8 text-center" data-testid={`card-download-${platform.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="w-16 h-16 rounded-2xl bg-[#9b6dff]/10 border border-[#9b6dff]/20 flex items-center justify-center mx-auto mb-6">
                <platform.icon className="w-8 h-8 text-[#9b6dff]" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{platform.title}</h3>
              <p className="text-[13px] text-[#6b6b80] leading-[1.7] mb-6">{platform.description}</p>
              {platform.available ? (
                <a
                  href="/signup"
                  className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-white"
                  style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }}
                  data-testid={`button-download-${platform.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {platform.cta}
                </a>
              ) : (
                <span className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-[#6b6b80] bg-white/[0.06] border border-white/[0.08]">
                  {platform.cta}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
}
