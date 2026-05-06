import { AppLayout } from "./components/layout/AppLayout";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { I18nProvider } from "./lib/i18n";
import { ThemeProvider } from "./lib/theme";

import Calendar from "./pages/Calendar";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <I18nProvider>
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
          </I18nProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
