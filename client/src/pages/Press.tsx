import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

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

        <div className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-12 text-center">
          <p className="text-[18px] font-semibold text-[#c9a6ff] mb-2">Coming Soon...</p>
          <p className="text-[14px] text-[#6b6b80]">We're working on updating our press coverage. Check back soon!</p>
        </div>
      </div>
    </InfoPageLayout>
  );
}
