import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { MapPin, Clock, ArrowRight } from "lucide-react";

const openings = [
  { title: "Senior Frontend Engineer", team: "Engineering", location: "Remote", type: "Full-time", description: "Help build beautiful, accessible interfaces that support people's mental wellness journeys." },
  { title: "Machine Learning Engineer", team: "AI", location: "Remote", type: "Full-time", description: "Develop and improve our AI models that analyse emotional patterns and generate personalised insights." },
  { title: "Product Designer", team: "Design", location: "Remote", type: "Full-time", description: "Design calming, intuitive experiences that make mental wellness tools feel welcoming and approachable." },
  { title: "Content Writer", team: "Marketing", location: "Remote", type: "Part-time", description: "Create thoughtful content about mental wellness, grounding techniques, and emotional resilience." },
];

export default function Careers() {
  return (
    <InfoPageLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <div className="mb-16">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            Join our{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              team
            </span>
          </h1>
          <p className="text-[15px] text-[#a0a0b4] leading-[1.8] max-w-[560px]">
            We're building tools that help people feel calmer, clearer, and more in control of their mental wellbeing. If that resonates with you, we'd love to hear from you.
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-6">Open Positions</h2>
        <div className="space-y-4">
          {openings.map((job) => (
            <div key={job.title} className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6" data-testid={`card-job-${job.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#9b6dff]/10 text-[#c9a6ff] border border-[#9b6dff]/20">{job.team}</span>
                </div>
                <h3 className="text-[16px] font-semibold mb-1">{job.title}</h3>
                <p className="text-[13px] text-[#6b6b80] leading-[1.6] mb-2">{job.description}</p>
                <div className="flex items-center gap-4 text-[12px] text-[#6b6b80]">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {job.type}</span>
                </div>
              </div>
              <a href="/contact" className="inline-flex items-center gap-1 text-[13px] text-[#9b6dff] font-medium flex-shrink-0">
                Apply <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-[#141420] rounded-[20px] border border-white/[0.08] p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Don't see the right role?</h3>
          <p className="text-[13px] text-[#6b6b80] mb-5 max-w-[400px] mx-auto">
            We're always looking for talented, compassionate people. Send us your CV and tell us how you'd like to contribute.
          </p>
          <a href="/contact" className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }} data-testid="link-careers-contact">
            Get in Touch
          </a>
        </div>
      </div>
    </InfoPageLayout>
  );
}
