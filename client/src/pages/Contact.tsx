import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Mail, MessageCircle, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <InfoPageLayout>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-[720px] mb-16">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            Get in{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              touch
            </span>
          </h1>
          <p className="text-[15px] text-[#6b6b80] leading-[1.7]">
            Have a question, suggestion, or just want to say hello? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10">
          <div className="space-y-6">
            {[
              { icon: Mail, title: "Email Us", detail: "support@focusmind.app", description: "We typically respond within 24 hours." },
              { icon: MessageCircle, title: "Live Chat", detail: "Available Mon-Fri, 9am-5pm", description: "Chat with our support team in real time." },
              { icon: MapPin, title: "Office", detail: "London, United Kingdom", description: "Visit us at our headquarters." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 bg-[#141420] rounded-[20px] border border-white/[0.08] p-6" data-testid={`card-contact-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="w-11 h-11 rounded-xl bg-[#9b6dff]/10 border border-[#9b6dff]/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-[#9b6dff]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold mb-1">{item.title}</h3>
                  <p className="text-[14px] text-white mb-1">{item.detail}</p>
                  <p className="text-[12px] text-[#6b6b80]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-8">
            <h2 className="text-xl font-semibold mb-6">Send us a message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-[14px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80]"
                  data-testid="input-contact-name"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-[14px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80]"
                  data-testid="input-contact-email"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-[14px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80]"
                data-testid="input-contact-subject"
              />
              <textarea
                placeholder="Your message"
                rows={5}
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-[14px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80] resize-none"
                data-testid="input-contact-message"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-full text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }}
                data-testid="button-contact-submit"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}
