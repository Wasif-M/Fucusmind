import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

const sections = [
  { title: "Acceptance of Terms", content: "By accessing or using FocusMind, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services. We may update these terms from time to time, and your continued use constitutes acceptance of any changes." },
  { title: "Description of Service", content: "FocusMind provides a mental wellness tracking platform that includes daily check-ins, AI-powered analysis, data visualisation, and grounding tools. Our service is designed for general wellness purposes and is not a substitute for professional medical advice, diagnosis, or treatment." },
  { title: "User Accounts", content: "You must create an account to use FocusMind. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information and notify us immediately of any unauthorised use." },
  { title: "Acceptable Use", content: "You agree to use FocusMind only for lawful purposes and in accordance with these terms. You must not misuse the service, attempt to gain unauthorised access, or interfere with other users' enjoyment of the platform." },
  { title: "Intellectual Property", content: "All content, features, and functionality of FocusMind, including text, graphics, logos, and software, are owned by FocusMind and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission." },
  { title: "AI Features Disclaimer", content: "FocusMind's AI features provide general wellness insights based on your check-in data. These insights are informational only and should not be considered medical or psychological advice. Always consult qualified healthcare professionals for health-related concerns." },
  { title: "Limitation of Liability", content: "FocusMind is provided 'as is' without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for the service in the preceding 12 months." },
  { title: "Termination", content: "We may suspend or terminate your account if you violate these terms. You may also close your account at any time. Upon termination, your right to use the service ceases, and we will delete your data according to our privacy policy." },
];

export default function TermsOfUse() {
  return (
    <InfoPageLayout>
      <div className="max-w-[720px] mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">Terms of Use</h1>
          <p className="text-[13px] text-[#6b6b80]">Last updated: February 1, 2026</p>
        </div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} data-testid={`section-terms-${i}`}>
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <p className="text-[14px] text-[#a0a0b4] leading-[1.8]">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.08]">
          <p className="text-[13px] text-[#6b6b80]">
            If you have any questions about these terms, please <a href="/contact" className="text-[#9b6dff]">contact us</a>.
          </p>
        </div>
      </div>
    </InfoPageLayout>
  );
}
