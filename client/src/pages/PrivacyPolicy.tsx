import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

const sections = [
  { title: "Information We Collect", content: "We collect information you provide directly, such as your name, email address, and wellness check-in data (mood scores, sleep hours, stress levels, and notes). We also collect usage data to improve our services, including how you interact with our features and tools." },
  { title: "How We Use Your Information", content: "Your data is used to provide and improve FocusMind's services, including generating AI-powered wellness insights, displaying your check-in history and trends, and personalising your experience. We never sell your personal data to third parties." },
  { title: "Data Storage & Security", content: "Your data is encrypted in transit and at rest. We use industry-standard security measures including SSL/TLS encryption, secure database storage, and regular security audits. Your wellness data is stored on secure servers with strict access controls." },
  { title: "AI & Data Processing", content: "When you use our AI features, your check-in data is processed to generate personalised insights. This processing happens securely, and your data is not used to train general AI models. The insights generated are private to your account." },
  { title: "Data Retention", content: "We retain your wellness data for as long as your account is active. If you delete your account, all associated data is permanently removed within 30 days. You can export your data at any time before deletion." },
  { title: "Your Rights", content: "You have the right to access, correct, or delete your personal data. You can export your data, request account deletion, or opt out of non-essential data processing at any time through your account settings or by contacting our support team." },
  { title: "Cookies", content: "We use essential cookies to maintain your session and keep you logged in. We do not use advertising or tracking cookies. For more details, see our Cookie Policy." },
  { title: "Changes to This Policy", content: "We may update this privacy policy from time to time. We will notify you of any material changes by email or through a notice on our application. Your continued use of FocusMind after changes constitutes acceptance of the updated policy." },
];

export default function PrivacyPolicy() {
  return (
    <InfoPageLayout>
      <div className="max-w-[720px] mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">Privacy Policy</h1>
          <p className="text-[13px] text-[#6b6b80]">Last updated: February 1, 2026</p>
        </div>

        <div className="mb-8">
          <p className="text-[14px] text-[#a0a0b4] leading-[1.8]">
            At FocusMind, your privacy is fundamental to everything we do. This policy explains how we collect, use, and protect your personal information when you use our mental wellness platform.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} data-testid={`section-privacy-${i}`}>
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <p className="text-[14px] text-[#a0a0b4] leading-[1.8]">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.08]">
          <p className="text-[13px] text-[#6b6b80]">
            If you have any questions about this privacy policy, please <a href="/contact" className="text-[#9b6dff]">contact us</a>.
          </p>
        </div>
      </div>
    </InfoPageLayout>
  );
}
