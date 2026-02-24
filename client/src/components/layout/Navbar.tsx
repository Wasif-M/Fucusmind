import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Menu, X, Wind, BookOpen, MessageCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function FocusMindLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a6ff" />
          <stop offset="100%" stopColor="#9b6dff" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="50" cy="50" r="44" stroke="url(#logoGradient)" strokeWidth="5" fill="none" />
      {/* Lotus petals */}
      <path d="M50 16 C44 28 40 36 50 44 C60 36 56 28 50 16Z" fill="url(#logoGradient)" />
      <path d="M33 26 C29 38 33 46 45 46 C45 38 39 30 33 26Z" fill="url(#logoGradient)" opacity="0.9" />
      <path d="M67 26 C71 38 67 46 55 46 C55 38 61 30 67 26Z" fill="url(#logoGradient)" opacity="0.9" />
      {/* Curved hands/waves */}
      <path d="M20 50 Q30 56 40 50 Q32 60 20 56" fill="url(#logoGradient)" opacity="0.8" />
      <path d="M80 50 Q70 56 60 50 Q68 60 80 56" fill="url(#logoGradient)" opacity="0.8" />
      {/* Water droplet */}
      <path d="M50 50 C50 50 40 62 40 72 C40 79 44.5 84 50 84 C55.5 84 60 79 60 72 C60 62 50 50 50 50Z" fill="url(#logoGradient)" />
    </svg>
  );
}

const appNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tools", label: "Grounding", icon: Wind },
  { href: "/history", label: "History", icon: BookOpen },
  { href: "/chat", label: "FocusMind Chat", icon: MessageCircle },
];

const marketingNavLinks = [
  { href: "/about", label: "About Us" },
  { href: "/features", label: "How It Works" },
  { href: "/pricing", label: "Programs" },
  { href: "/blog", label: "Community" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, logout, isLoggingOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{
      background: "rgba(10, 10, 15, 0.6)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group" data-testid="link-logo">
            <FocusMindLogo size={36} />
            <span className="text-[18px] font-bold tracking-tight text-[#c9a6ff]" style={{ fontFamily: "'Inter', sans-serif" }}>
              FocusMind
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              {appNavLinks.map((link) => {
                const isActive = location === link.href || (link.href === "/dashboard" && location === "/");
                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      data-testid={`nav-${link.label.toLowerCase()}`}
                      variant="ghost"
                      className={`text-sm ${
                        isActive
                          ? "text-white bg-white/10"
                          : "text-[#a0a0b4]"
                      }`}
                    >
                      <link.icon className="mr-2 h-4 w-4" /> {link.label}
                    </Button>
                  </Link>
                );
              })}
              <div className="h-6 w-px bg-white/10 mx-2" />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white/80">
                  {user.firstName || user.email || "User"}
                </span>
                <Button
                  data-testid="button-sign-out"
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="border-white/10"
                >
                  {isLoggingOut ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-3 w-3" />
                  )}
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-6 mr-6">
                {marketingNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[13px] text-[#a0a0b4] transition-colors hover:text-white"
                    data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <Link
                href="/login"
                data-testid="button-login"
                className="no-default-hover-elevate no-default-active-elevate inline-flex items-center px-5 py-2 rounded-full text-[13px] font-medium text-white/80 border border-white/15 transition-all hover:text-white hover:border-white/30 hover:bg-white/5"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                data-testid="button-signup"
                className="inline-flex items-center px-5 py-2 rounded-full text-[13px] font-medium text-white transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #9b6dff, #7c4dff)"
                }}
              >
                Start Free Trial
              </Link>
            </>
          )}
        </div>

        <button
          data-testid="button-mobile-menu"
          className="md:hidden text-white/80"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden absolute top-full left-0 right-0"
            style={{
              background: "rgba(10, 10, 15, 0.95)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.05)"
            }}
          >
            <div className="p-4 space-y-2 flex flex-col">
              {user ? (
                <>
                  {appNavLinks.map((link) => {
                    const isActive = location === link.href || (link.href === "/dashboard" && location === "/");
                    return (
                      <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                        <span className={`flex items-center gap-3 p-3 rounded-lg font-medium cursor-pointer ${
                          isActive ? "bg-white/10 text-white" : "text-[#a0a0b4]"
                        }`}>
                          <link.icon className="w-4 h-4" />
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                  <div className="border-t border-white/10 my-2" />
                  <button
                    data-testid="button-mobile-sign-out"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="w-full text-left p-3 rounded-lg text-red-400 font-medium flex items-center gap-3 disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </>
              ) : (
                <>
                  {marketingNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block p-3 rounded-lg text-[#a0a0b4] font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`nav-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="border-t border-white/10 my-2" />
                  <Link
                    href="/login"
                    className="block text-center p-3 rounded-lg text-white/80 font-medium border border-white/15"
                    data-testid="button-mobile-login"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-center p-3 rounded-lg text-white font-bold"
                    style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="button-mobile-start-trial"
                  >
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
