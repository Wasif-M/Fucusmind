import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface InfoPageLayoutProps {
  children: React.ReactNode;
}

export function InfoPageLayout({ children }: InfoPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <main className="pt-24 pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
