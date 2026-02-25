import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-url";

function FocusMindLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a6ff" />
          <stop offset="100%" stopColor="#9b6dff" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="50" cy="50" r="44" stroke="url(#footerLogoGradient)" strokeWidth="5" fill="none" />
      {/* Lotus petals */}
      <path d="M50 16 C44 28 40 36 50 44 C60 36 56 28 50 16Z" fill="url(#footerLogoGradient)" />
      <path d="M33 26 C29 38 33 46 45 46 C45 38 39 30 33 26Z" fill="url(#footerLogoGradient)" opacity="0.9" />
      <path d="M67 26 C71 38 67 46 55 46 C55 38 61 30 67 26Z" fill="url(#footerLogoGradient)" opacity="0.9" />
      {/* Curved hands/waves */}
      <path d="M20 50 Q30 56 40 50 Q32 60 20 56" fill="url(#footerLogoGradient)" opacity="0.8" />
      <path d="M80 50 Q70 56 60 50 Q68 60 80 56" fill="url(#footerLogoGradient)" opacity="0.8" />
      {/* Water droplet */}
      <path d="M50 50 C50 50 40 62 40 72 C40 79 44.5 84 50 84 C55.5 84 60 79 60 72 C60 62 50 50 50 50Z" fill="url(#footerLogoGradient)" />
    </svg>
  );
}

const footerColumns = [
  { title: "Product", links: [
    { label: "Features", href: "/features" },
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
  ]},
  { title: "Support", links: [
    { label: "Help Centre", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "Status", href: "/status" },
    { label: "FAQ", href: "/faq" },
  ]},
  { title: "Resources", links: [
    { label: "Blog", href: "/blog" },
    { label: "Wellbeing Tips", href: "/wellbeing-tips" },
    { label: "Press", href: "/press" },
  ]},
  { title: "Legal", links: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
  ]},
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl("/api/subscribe"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorToast = toast({
          title: "Error",
          description: data.message || "Failed to subscribe",
          variant: "destructive",
        });
        setTimeout(() => errorToast.dismiss(), 5000);
        return;
      }

      const successToast = toast({
        title: "Success",
        description: "Check your email for a welcome message!",
      });
      setTimeout(() => successToast.dismiss(), 5000);

      setEmail("");
    } catch (error) {
      console.error("Subscribe error:", error);
      const errorToast = toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => errorToast.dismiss(), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="border-t border-white/[0.08] pt-20 pb-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 md:gap-[60px] mb-16">
          <div>
            <Link href="/">
              <div className="flex items-center gap-3 text-lg font-bold mb-2 cursor-pointer" data-testid="link-footer-logo">
                <FocusMindLogo size={32} />
                <span className="text-[#c9a6ff]" style={{ fontFamily: "'Inter', sans-serif" }}>FocusMind</span>
              </div>
            </Link>
            <p className="text-[13px] text-[#6b6b80] italic mb-6">Feel clearer, live lighter.</p>
            <form className="flex gap-2 mb-6" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-[10px] text-white text-[13px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80]"
                data-testid="input-newsletter-email"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#9b6dff] text-white border-none rounded-[10px] text-[13px] font-medium whitespace-nowrap transition-colors hover:bg-[#6b3fa0] disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-subscribe"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            <div className="flex gap-4">
              {[
                <svg key="fb" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
                <svg key="ig" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>,
                <svg key="yt" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.267 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/></svg>,
                <svg key="tw" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
              ].map((icon, i) => (
                <div key={i} className="text-[#6b6b80]" aria-label="Social icon" data-testid={`icon-social-${i}`}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h5 className="text-sm font-semibold mb-4 text-white">{col.title}</h5>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[13px] text-[#6b6b80] transition-colors hover:text-[#9b6dff]" data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-white/[0.08] pt-6 text-center">
          <p className="text-[12px] text-[#6b6b80]">&copy; 2026 FocusMind. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
