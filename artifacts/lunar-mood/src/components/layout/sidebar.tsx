import { useState } from "react";
import { useGetMe, useUpdateProfile } from "@workspace/api-client-react";
import { useAppAuth } from "@/hooks/use-app-state";
import { Button } from "@/components/ui/button";
import { LogOut, Moon, Sparkles, Activity, Zap, Coffee, Settings, Check, X } from "lucide-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

interface SidebarStats {
  avgMood: number;
  totalEntries: number;
  avgEnergy?: number;
  avgConsumption?: number;
}

export function Sidebar({ stats, consumptionLabel = "Café" }: { stats?: SidebarStats; consumptionLabel?: string }) {
  const { data: user } = useGetMe({ query: { retry: false } });
  const { logout } = useAppAuth();
  const [, setLocation] = useLocation();
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState(consumptionLabel);
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        setIsEditingLabel(false);
      },
    },
  });

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/login");
      }
    });
  };

  const handleSaveLabel = () => {
    if (labelInput.trim()) {
      updateProfile.mutate({ data: { consumptionLabel: labelInput.trim() } });
    }
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
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Statistiques</h2>
            
            <div className="grid gap-3">
              <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold">{stats.totalEntries}</p>
                  <p className="text-xs text-muted-foreground">Entrées ce mois</p>
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
                  <p className="text-xs text-muted-foreground">Émotion moyenne</p>
                </div>
              </div>

              {stats.avgEnergy !== undefined && (
                <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-semibold">{stats.avgEnergy}%</p>
                    <p className="text-xs text-muted-foreground">Énergie moyenne</p>
                  </div>
                </div>
              )}

              {stats.avgConsumption !== undefined && (
                <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-semibold">{stats.avgConsumption}</p>
                    <p className="text-xs text-muted-foreground">{consumptionLabel} moyen</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Réglages</h2>
          <div className="glass-panel rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Catégorie conso.</p>
              {!isEditingLabel && (
                <button
                  onClick={() => { setLabelInput(consumptionLabel); setIsEditingLabel(true); }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {isEditingLabel ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveLabel()}
                />
                <button onClick={handleSaveLabel} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                <button onClick={() => setIsEditingLabel(false)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <p className="text-sm font-medium">{consumptionLabel}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 mt-auto">
        <Button 
          variant="outline" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10" 
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {logout.isPending ? "Déconnexion..." : "Déconnexion"}
        </Button>
      </div>
    </aside>
  );
}
