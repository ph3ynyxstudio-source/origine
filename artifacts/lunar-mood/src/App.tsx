import { Switch, Route, Router as WouterRouter, useLocation } from "wouter"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "@/lib/i18n"
import { useGetMe } from "@workspace/api-client-react"
import { useEffect, useRef } from "react"

// Pages
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import Calendar from "@/pages/Calendar"
import Statistics from "@/pages/Statistics"
import Settings from "@/pages/Settings"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useGetMe()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login")
    }
  }, [isLoading, user, setLocation])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  return <Component />
}

function CatchAllRedirect({ user }: { user: unknown }) {
  const [, setLocation] = useLocation()
  useEffect(() => {
    setLocation(user ? "/dashboard" : "/login")
  }, [user, setLocation])
  return null
}

function MainRouter() {
  const { data: user, isLoading } = useGetMe()
  const [location, setLocation] = useLocation()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (isLoading) return

    if (user && (location === "/" || location === "/login")) {
      if (!hasRedirected.current) {
        hasRedirected.current = true
        setLocation("/dashboard")
      }
    } else if (!user && location !== "/" && location !== "/login") {
      if (!hasRedirected.current) {
        hasRedirected.current = true
        setLocation("/login")
      }
    } else {
      hasRedirected.current = false
    }
  }, [user, isLoading, location, setLocation])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/calendar"><ProtectedRoute component={Calendar} /></Route>
      <Route path="/statistics"><ProtectedRoute component={Statistics} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>
      <Route><CatchAllRedirect user={user} /></Route>
    </Switch>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <MainRouter />
          </WouterRouter>
          <Toaster />
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App;
