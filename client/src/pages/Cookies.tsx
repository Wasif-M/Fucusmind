import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

const sections = [
  { title: "What Are Cookies?", content: "Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience. Cookies can be 'session' cookies (deleted when you close your browser) or 'persistent' cookies (remain until they expire or you delete them)." },
  { title: "Cookies We Use", content: "FocusMind uses only essential cookies that are necessary for the platform to function correctly. These include session cookies to keep you logged in and security cookies to protect your account. We do not use advertising, analytics, or third-party tracking cookies." },
  { title: "Session Cookies", content: "We use a session cookie to maintain your login state as you navigate FocusMind. This cookie is encrypted and contains only a session identifier -- it does not store any of your personal or wellness data. It expires when you log out or after a period of inactivity." },
  { title: "Security Cookies", content: "We use security cookies to help protect your account from unauthorised access. These cookies help us verify your identity and prevent cross-site request forgery attacks." },
  { title: "Managing Cookies", content: "Since we only use essential cookies, disabling them may prevent FocusMind from working properly. Most browsers allow you to manage cookies through their settings. You can typically find these options in your browser's Privacy or Security settings." },
  { title: "Changes to This Policy", content: "We may update this cookie policy from time to time to reflect changes in our practices or for operational, legal, or regulatory reasons. We encourage you to review this page periodically." },
];

export default function CookiesPage() {
  return (
    <InfoPageLayout>
      <div className="max-w-[720px] mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">Cookie Policy</h1>
          <p className="text-[13px] text-[#6b6b80]">Last updated: February 1, 2026</p>
        </div>

        <div className="mb-8">
          <p className="text-[14px] text-[#a0a0b4] leading-[1.8]">
            This policy explains how FocusMind uses cookies and similar technologies. We believe in transparency and want you to understand exactly what data is stored on your device.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} data-testid={`section-cookies-${i}`}>
              <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
              <p className="text-[14px] text-[#a0a0b4] leading-[1.8]">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.08]">
          <p className="text-[13px] text-[#6b6b80]">
            If you have any questions about our use of cookies, please <a href="/contact" className="text-[#9b6dff]">contact us</a>.
          </p>
        </div>
      </div>
    </InfoPageLayout>
  );
}
