import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { UserAvatarButton } from "@/components/user-avatar-button";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import GroundingTools from "@/pages/GroundingTools";
import Features from "@/pages/Features";
import About from "@/pages/About";
import Pricing from "@/pages/Pricing";
import Download from "@/pages/Download";
import HelpCentre from "@/pages/HelpCentre";
import Contact from "@/pages/Contact";
import StatusPage from "@/pages/Status";
import FAQ from "@/pages/FAQ";
import Blog, { BlogPost } from "@/pages/Blog";
import WellbeingTips from "@/pages/WellbeingTips";
import Press from "@/pages/Press";
import Careers from "@/pages/Careers";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import CookiesPage from "@/pages/Cookies";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import Chat from "@/pages/Chat";
import Tracking from "@/pages/Tracking";
import AudioSessions from "@/pages/AudioSessions";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/tracking" component={Tracking} />
      <Route path="/tools" component={GroundingTools} />
      <Route path="/chat" component={Chat} />
      <Route path="/audio" component={AudioSessions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function MarketingRoutes() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/download" component={Download} />
      <Route path="/help" component={HelpCentre} />
      <Route path="/contact" component={Contact} />
      <Route path="/status" component={StatusPage} />
      <Route path="/faq" component={FAQ} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/wellbeing-tips" component={WellbeingTips} />
      <Route path="/press" component={Press} />
      <Route path="/careers" component={Careers} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfUse} />
      <Route path="/cookies" component={CookiesPage} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "15rem",
  "--sidebar-width-icon": "3.5rem",
};

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    return (
      <>
        <ScrollToTop />
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full overflow-hidden">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center justify-between h-12 px-3 border-b border-white/[0.06] flex-shrink-0 bg-background/80 backdrop-blur-md z-10">
                <SidebarTrigger data-testid="button-sidebar-toggle" className="text-[#a0a0b4]" />
                <UserAvatarButton />
              </header>
              <main className="flex-1 overflow-y-auto">
                <AuthenticatedRoutes />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <MarketingRoutes />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
