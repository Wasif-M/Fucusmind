import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Check, X, CreditCard, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the basics of mental wellness tracking.",
    features: [
      "Daily mood check-ins",
      "Basic stress tracking",
      "1 grounding exercise",
      "7-day history",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$20",
    period: "per month",
    description: "Unlock AI insights and the full suite of wellness tools.",
    features: [
      "Everything in Free",
      "AI-powered analysis",
      "All grounding tools",
      "Full check-in history",
      "Clarity Insights charts",
      "Weekly wellness reports",
      "Priority support",
    ],
    cta: "Get the Plan",
    highlighted: true,
  },
];

export default function Pricing() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    country: "United States",
    postalCode: "",
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === "cardNumber") {
      // Format card number with spaces
      const cleaned = value.replace(/\s/g, "").replace(/\D/g, "");
      const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
      setFormData({ ...formData, [field]: formatted.slice(0, 19) });
    } else if (field === "expiry") {
      // Format expiry as MM/YY
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length >= 2) {
        setFormData({ ...formData, [field]: cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4) });
      } else {
        setFormData({ ...formData, [field]: cleaned });
      }
    } else if (field === "cvc") {
      setFormData({ ...formData, [field]: value.replace(/\D/g, "").slice(0, 4) });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend only - no backend integration
    alert("Thank you! Your subscription would be processed here.");
    setCheckoutOpen(false);
  };

  return (
    <InfoPageLayout>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">
            Simple, transparent{" "}
            <span className="text-[#c9a6ff]" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              pricing
            </span>
          </h1>
          <p className="text-[15px] text-[#6b6b80] max-w-[480px] mx-auto">
            Start free and upgrade when you're ready. No hidden fees, cancel any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[700px] mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[20px] border p-8 flex flex-col ${
                plan.highlighted
                  ? "bg-[#1a1a2e] border-[#9b6dff]/40"
                  : "bg-[#141420] border-white/[0.08]"
              }`}
              data-testid={`card-plan-${plan.name.toLowerCase()}`}
            >
              {plan.highlighted && (
                <span className="inline-block w-fit px-3 py-1 rounded-full text-[11px] font-medium bg-[#9b6dff]/15 text-[#c9a6ff] border border-[#9b6dff]/30 mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-[36px] font-semibold">{plan.price}</span>
                <span className="text-[13px] text-[#6b6b80]">/{plan.period}</span>
              </div>
              <p className="text-[13px] text-[#6b6b80] leading-[1.6] mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13px] text-[#a0a0b4]">
                    <Check className="w-4 h-4 text-[#9b6dff] mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.highlighted ? (
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="block text-center py-3 rounded-full text-sm font-medium transition-all text-white cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }}
                  data-testid={`button-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.cta}
                </button>
              ) : (
                <a
                  href="/signup"
                  className="block text-center py-3 rounded-full text-sm font-medium transition-all bg-white/[0.06] text-white border border-white/[0.08]"
                  data-testid={`button-plan-${plan.name.toLowerCase()}`}
                >
                  {plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stripe-style Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[480px] bg-[#0f0f15] border-white/10 p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-[#9b6dff]/20 to-transparent p-6 border-b border-white/10">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#9b6dff]" />
                Subscribe to Pro
              </DialogTitle>
            </DialogHeader>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">$20</span>
              <span className="text-[#6b6b80]">/month</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] text-[#a0a0b4]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-[#1a1a2e] border-white/10 focus:border-[#9b6dff] text-white placeholder:text-[#6b6b80]"
                required
              />
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[13px] text-[#a0a0b4]">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="bg-[#1a1a2e] border-white/10 focus:border-[#9b6dff] text-white placeholder:text-[#6b6b80]"
                required
              />
            </div>

            {/* Card Information */}
            <div className="space-y-2">
              <Label className="text-[13px] text-[#a0a0b4]">Card information</Label>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="1234 1234 1234 1234"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                    className="bg-[#1a1a2e] border-0 border-b border-white/10 rounded-none text-white placeholder:text-[#6b6b80] pr-20"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-8 h-5 bg-gradient-to-r from-[#1a1f71] to-[#2b4bc1] rounded text-[8px] text-white flex items-center justify-center font-bold">VISA</div>
                    <div className="w-8 h-5 bg-gradient-to-r from-[#eb001b] to-[#f79e1b] rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-[#eb001b] rounded-full opacity-80" />
                      <div className="w-3 h-3 bg-[#f79e1b] rounded-full -ml-1 opacity-80" />
                    </div>
                  </div>
                </div>
                <div className="flex">
                  <Input
                    type="text"
                    placeholder="MM / YY"
                    value={formData.expiry}
                    onChange={(e) => handleInputChange("expiry", e.target.value)}
                    className="bg-[#1a1a2e] border-0 border-r border-white/10 rounded-none flex-1 text-white placeholder:text-[#6b6b80]"
                    required
                  />
                  <Input
                    type="text"
                    placeholder="CVC"
                    value={formData.cvc}
                    onChange={(e) => handleInputChange("cvc", e.target.value)}
                    className="bg-[#1a1a2e] border-0 rounded-none flex-1 text-white placeholder:text-[#6b6b80]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Country & Postal */}
            <div className="space-y-2">
              <Label className="text-[13px] text-[#a0a0b4]">Country or region</Label>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="w-full bg-[#1a1a2e] border-0 border-b border-white/10 text-white p-3 text-sm outline-none"
                >
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Pakistan</option>
                  <option>India</option>
                  <option>Other</option>
                </select>
                <Input
                  type="text"
                  placeholder="Postal code"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange("postalCode", e.target.value)}
                  className="bg-[#1a1a2e] border-0 rounded-none text-white placeholder:text-[#6b6b80]"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-6 text-base font-medium rounded-lg"
              style={{ background: "linear-gradient(135deg, #9b6dff, #7c4dff)" }}
            >
              <Lock className="w-4 h-4 mr-2" />
              Subscribe — $20/month
            </Button>

            {/* Security notice */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#6b6b80]">
              <Shield className="w-3 h-3" />
              <span>Secured by industry-standard encryption</span>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </InfoPageLayout>
  );
}
