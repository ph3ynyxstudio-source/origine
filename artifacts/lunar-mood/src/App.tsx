import { useState } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { I18nProvider, useTranslation } from "./lib/i18n";
import { ThemeProvider } from "./lib/theme";

import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#03050F] px-6 text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center text-center">
        <div className="flex h-56 w-56 items-center justify-center rounded-[3rem] border border-[rgba(244,190,160,0.18)] bg-[#080520]/80 shadow-[0_0_36px_rgba(34,211,238,0.10)] sm:h-64 sm:w-64">
          <img
            src="/icon-home.png"
            alt="Lun4rMood"
            width={224}
            height={224}
            className="h-48 w-48 object-contain opacity-95 drop-shadow-[0_0_18px_rgba(34,211,238,0.14)] sm:h-56 sm:w-56"
            decoding="async"
          />
        </div>

        <img
          src="/Typo_marketing.webp"
          alt="Lun4rMood"
          width={260}
          height={96}
          className="mt-8 max-h-20 w-full max-w-[260px] object-contain opacity-95"
          decoding="async"
        />

        <p className="mt-5 max-w-xs text-sm leading-relaxed text-(--text-muted)">
          {t("welcomeTagline")}
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="mt-8 rounded-full border border-[rgba(244,190,160,0.26)] bg-linear-to-r from-primary/20 via-secondary/20 to-primary/20 px-10 py-3 text-sm font-semibold text-foreground shadow-[0_0_24px_rgba(34,211,238,0.16)] transition-colors hover:border-primary/35 hover:text-primary"
        >
          {t("welcomeEnter")}
        </button>
      </div>
    </div>
  );
}

function AppShell() {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeScreen onEnter={() => setShowWelcome(false)} />;
  }

  return (
    <>
      <WouterRouter>
        <AppLayout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/statistics" component={Statistics} />
            <Route path="/settings" component={Settings} />
          </Switch>
        </AppLayout>
      </WouterRouter>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <I18nProvider>
            <AppShell />
          </I18nProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
