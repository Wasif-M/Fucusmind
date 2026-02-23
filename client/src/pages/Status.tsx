import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { CheckCircle, Circle } from "lucide-react";

const services = [
  { name: "Web Application", status: "operational", uptime: "99.98%" },
  { name: "API Services", status: "operational", uptime: "99.95%" },
  { name: "AI Analysis Engine", status: "operational", uptime: "99.90%" },
  { name: "Database", status: "operational", uptime: "99.99%" },
  { name: "Authentication", status: "operational", uptime: "99.97%" },
];

const recentIncidents = [
  { date: "Jan 28, 2026", title: "Scheduled maintenance completed", description: "Database optimisation and performance improvements were applied successfully.", status: "resolved" },
  { date: "Jan 15, 2026", title: "Brief API latency increase", description: "Some users experienced slower response times for approximately 12 minutes. The issue was identified and resolved.", status: "resolved" },
];

export default function StatusPage() {
  return (
    <InfoPageLayout>
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Circle className="w-3 h-3 fill-emerald-400 text-emerald-400" />
            <span className="text-[13px] font-medium text-emerald-400">All Systems Operational</span>
          </div>
          <h1 className="text-[clamp(32px,4vw,48px)] font-semibold mb-4">System Status</h1>
          <p className="text-[15px] text-[#6b6b80]">Real-time status of FocusMind services.</p>
        </div>

        <div className="bg-[#141420] rounded-[20px] border border-white/[0.08] overflow-hidden mb-10">
          {services.map((service, i) => (
            <div
              key={service.name}
              className={`flex items-center justify-between px-6 py-4 ${i < services.length - 1 ? "border-b border-white/[0.06]" : ""}`}
              data-testid={`status-${service.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-[14px] font-medium">{service.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12px] text-[#6b6b80]">{service.uptime} uptime</span>
                <span className="text-[12px] text-emerald-400 font-medium">Operational</span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>
        <div className="space-y-4">
          {recentIncidents.map((incident) => (
            <div key={incident.date} className="bg-[#141420] rounded-[20px] border border-white/[0.08] p-6">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h3 className="text-[14px] font-semibold">{incident.title}</h3>
                <span className="text-[12px] text-[#6b6b80]">{incident.date}</span>
              </div>
              <p className="text-[13px] text-[#6b6b80] leading-[1.6]">{incident.description}</p>
            </div>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  );
}
