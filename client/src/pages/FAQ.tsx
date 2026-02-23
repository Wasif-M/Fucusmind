import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "What is FocusMind?", a: "FocusMind is a mental wellness tracking application that helps you monitor your mood, sleep, and stress levels through daily check-ins. It provides AI-powered analysis, data visualisation through charts, and grounding tools like breathing exercises and meditation timers." },
  { q: "Is FocusMind free to use?", a: "Yes, FocusMind offers a free tier that includes daily mood check-ins, basic stress tracking, and access to one grounding exercise. For AI insights, full history, and all tools, you can upgrade to our Pro plan." },
  { q: "How does the AI analysis work?", a: "Our AI analyses your check-in data over time to identify patterns in your mood, stress, and sleep. It then provides personalised insights and recommendations to help you understand your emotional patterns and build healthier habits." },
  { q: "Is my data private and secure?", a: "Absolutely. Your wellness data is encrypted and stored securely. We never share your personal information with third parties. You can read our full privacy policy for more details." },
  { q: "What are grounding tools?", a: "Grounding tools are quick, science-backed exercises designed to calm your nervous system. FocusMind includes the 4-7-8 breathing technique, the 5-4-3-2-1 senses exercise, and a guided meditation timer." },
  { q: "Can I export my data?", a: "Yes, Pro users can export their complete check-in history and wellness data at any time from their account settings." },
  { q: "How often should I check in?", a: "We recommend checking in at least once a day to build a complete picture of your wellness patterns. Many users find it helpful to check in both morning and evening." },
  { q: "Can I delete my account?", a: "Yes, you can delete your account and all associated data at any time from your account settings. Once deleted, your data cannot be recovered." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <InfoPageLayout>
      <div className="max-w-[720px] mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            Frequently asked{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              questions
            </span>
          </h1>
          <p className="text-[15px] text-[#6b6b80]">Everything you need to know about FocusMind.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-[#141420] rounded-[16px] border border-white/[0.08] overflow-hidden"
              data-testid={`faq-item-${i}`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                data-testid={`button-faq-${i}`}
              >
                <span className="text-[14px] font-medium">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#6b6b80] flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-[13px] text-[#a0a0b4] leading-[1.7]">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-[13px] text-[#6b6b80] mb-4">Still have questions?</p>
          <a href="/contact" className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }} data-testid="link-faq-contact">
            Contact Us
          </a>
        </div>
      </div>
    </InfoPageLayout>
  );
}
