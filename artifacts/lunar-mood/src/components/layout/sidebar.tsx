import { useGetMe } from "@workspace/api-client-react";
import { useAppAuth } from "@/hooks/use-app-state";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sparkles, Activity } from "lucide-react";
import { useLocation } from "wouter";

export function Sidebar({ stats }: { stats?: { avgMood: number, totalEntries: number } }) {
  const { data: user } = useGetMe({ query: { retry: false } });
  const { logout } = useAppAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/login");
      }
    });
  };

  return (
    <aside className="w-full md:w-72 glass border-l-0 border-t-0 border-b-0 flex flex-col h-full sticky top-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(167,139,250,0.3)]">
          <Moon className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gradient">LunarMood</h1>
      </div>

      <div className="px-8 py-6 flex-1 flex flex-col gap-8">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Orbit</h2>
          <div className="glass-panel rounded-2xl p-5 space-y-1">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="text-lg font-medium text-foreground truncate">{user?.username}</p>
          </div>
        </div>

        {stats && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Constellations</h2>
            
            <div className="grid gap-3">
              <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold">{stats.totalEntries}</p>
                  <p className="text-xs text-muted-foreground">Entries this month</p>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold">
                    {stats.avgMood ? stats.avgMood.toFixed(1) : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Average Mood</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 mt-auto">
        <Button 
          variant="outline" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10" 
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logout.isPending ? "Departing..." : "Sign Out"}
        </Button>
      </div>
    </aside>
  );
}
