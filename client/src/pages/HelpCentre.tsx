import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Search, BookOpen, MessageCircle, Settings, Shield, BarChart3 } from "lucide-react";
import { useState } from "react";

const categories = [
  { icon: BookOpen, title: "Getting Started", articles: ["How to create your first check-in", "Understanding your dashboard", "Setting up daily reminders"] },
  { icon: BarChart3, title: "Insights & Charts", articles: ["Reading your mood trends", "Understanding stress patterns", "Weekly report breakdown"] },
  { icon: MessageCircle, title: "AI Features", articles: ["How AI analysis works", "Getting better insights", "Chat with your AI companion"] },
  { icon: Settings, title: "Account & Settings", articles: ["Managing your profile", "Notification preferences", "Exporting your data"] },
  { icon: Shield, title: "Privacy & Security", articles: ["How we protect your data", "Deleting your account", "Data retention policy"] },
];

export default function HelpCentre() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <InfoPageLayout>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            How can we{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              help?
            </span>
          </h1>
          <div className="max-w-[480px] mx-auto relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b6b80]" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#141420] border border-white/[0.08] rounded-2xl text-white text-[14px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80]"
              data-testid="input-help-search"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.title} className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-7" data-testid={`card-help-${cat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <cat.icon className="w-7 h-7 text-[#9b6dff] mb-4" />
              <h3 className="text-lg font-semibold mb-4">{cat.title}</h3>
              <ul className="space-y-3">
                {cat.articles.map((article) => (
                  <li key={article}>
                    <a href="#" className="text-[13px] text-[#a0a0b4] leading-[1.6] transition-colors hover:text-[#9b6dff]">
                      {article}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 bg-[#141420] rounded-[20px] border border-white/[0.08] p-10">
          <h2 className="text-xl font-semibold mb-3">Still need help?</h2>
          <p className="text-[13px] text-[#6b6b80] mb-6 max-w-[400px] mx-auto">
            Our support team is here to help you with any questions or issues you might have.
          </p>
          <a href="/contact" className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }} data-testid="link-help-contact">
            Contact Support
          </a>
        </div>
      </div>
    </InfoPageLayout>
  );
}
