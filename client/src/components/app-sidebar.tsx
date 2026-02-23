import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, Wind, MessageCircle, LogOut, BarChart3, Headphones } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

function FocusMindLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a6ff" />
          <stop offset="100%" stopColor="#9b6dff" />
        </linearGradient>
      </defs>
      {/* Outer circle */}
      <circle cx="50" cy="50" r="44" stroke="url(#sidebarLogoGradient)" strokeWidth="5" fill="none" />
      {/* Lotus petals */}
      <path d="M50 16 C44 28 40 36 50 44 C60 36 56 28 50 16Z" fill="url(#sidebarLogoGradient)" />
      <path d="M33 26 C29 38 33 46 45 46 C45 38 39 30 33 26Z" fill="url(#sidebarLogoGradient)" opacity="0.9" />
      <path d="M67 26 C71 38 67 46 55 46 C55 38 61 30 67 26Z" fill="url(#sidebarLogoGradient)" opacity="0.9" />
      {/* Curved hands/waves */}
      <path d="M20 50 Q30 56 40 50 Q32 60 20 56" fill="url(#sidebarLogoGradient)" opacity="0.8" />
      <path d="M80 50 Q70 56 60 50 Q68 60 80 56" fill="url(#sidebarLogoGradient)" opacity="0.8" />
      {/* Water droplet */}
      <path d="M50 50 C50 50 40 62 40 72 C40 79 44.5 84 50 84 C55.5 84 60 79 60 72 C60 62 50 50 50 50Z" fill="url(#sidebarLogoGradient)" />
    </svg>
  );
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracking", label: "Tracking", icon: BarChart3 },
  { href: "/tools", label: "Grounding", icon: Wind },
  { href: "/audio", label: "Audio Sessions", icon: Headphones },
  { href: "/chat", label: "FocusMind Chat", icon: MessageCircle },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group" data-testid="link-sidebar-logo">
            <FocusMindLogo size={32} />
            <span className="text-[16px] font-bold tracking-tight text-[#c9a6ff] group-data-[collapsible=icon]:hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
              FocusMind
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link href={item.href} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Sign Out"
                onClick={() => logout()}
                data-testid="button-sidebar-sign-out"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[13px]">Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
