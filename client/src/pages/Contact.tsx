import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-url";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = getApiUrl("/api/contact");
      console.log("Sending contact form to:", apiUrl);
      console.log("Form data:", formData);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        data = { message: "Server error" };
      }

      console.log("Response data:", data);

      if (!response.ok) {
        const errorToast = toast({
          title: "Error",
          description: data.message || "Failed to send message",
          variant: "destructive",
        });
        setTimeout(() => errorToast.dismiss(), 5000);
        return;
      }

      const successToast = toast({
        title: "Success",
        description: data.message,
      });
      setTimeout(() => successToast.dismiss(), 5000);

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      const errorToast = toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => errorToast.dismiss(), 5000);
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="max-w-[600px]">
          <div className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-8">
            <h2 className="text-xl font-semibold mb-6">Send us a message</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-[14px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80]"
                  data-testid="input-contact-name"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-[14px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80]"
                  data-testid="input-contact-email"
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-[14px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80]"
                data-testid="input-contact-subject"
              />
              <textarea
                name="message"
                placeholder="Your message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-[14px] outline-none focus:border-[#9b6dff] placeholder:text-[#6b6b80] resize-none"
                data-testid="input-contact-message"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }}
                data-testid="button-contact-submit"
              >
                {isLoading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </InfoPageLayout>
  );
}
