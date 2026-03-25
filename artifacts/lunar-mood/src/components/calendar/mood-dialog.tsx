import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getMoodColorClass, getMoodEmoji, getMoodLabel, PERIOD_LABELS, PERIOD_COLORS, getConsumptionLabel, cn } from "@/lib/utils";
import type { MoodEntry, LunarPhase } from "@workspace/api-client-react";
import { useAppMoods } from "@/hooks/use-app-state";
import { Trash2 } from "lucide-react";

const PERIODS = ["morning", "afternoon", "evening"] as const;
const ENERGY_STEPS = [0, 25, 50, 75, 100];

interface MoodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  entries?: MoodEntry[];
  lunarPhase?: LunarPhase;
  consumptionLabel?: string;
}

export function MoodDialog({ isOpen, onClose, date, entries = [], lunarPhase, consumptionLabel = "Café" }: MoodDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<typeof PERIODS[number]>("morning");
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(50);
  const [consumption, setConsumption] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const { createMood, updateMood, deleteMood } = useAppMoods();

  const existingEntry = entries.find(e => e.period === selectedPeriod);

  useEffect(() => {
    if (existingEntry) {
      setMood(existingEntry.mood);
      setEnergy(existingEntry.energy);
      setConsumption(existingEntry.consumption);
      setNote(existingEntry.note || "");
    } else {
      setMood(3);
      setEnergy(50);
      setConsumption(0);
      setNote("");
    }
  }, [existingEntry, selectedPeriod, isOpen]);

  const handleSave = () => {
    if (!date) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    if (existingEntry) {
      updateMood.mutate(
        { id: existingEntry.id, data: { mood, energy, consumption, note: note || null } },
        { onSuccess: onClose }
      );
    } else {
      createMood.mutate(
        { data: { date: formattedDate, period: selectedPeriod, mood, energy, consumption, note: note || null } },
        { onSuccess: onClose }
      );
    }
  };

  const handleDelete = () => {
    if (existingEntry) {
      deleteMood.mutate(
        { id: existingEntry.id },
        { onSuccess: onClose }
      );
    }
  };

  if (!date) return null;

  const isPending = createMood.isPending || updateMood.isPending || deleteMood.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{format(date, 'MMMM do, yyyy')}</DialogTitle>
            {lunarPhase && (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <span className="text-lg">{lunarPhase.emoji}</span>
                <span className="text-xs text-muted-foreground capitalize">{lunarPhase.phase.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Période</label>
            <div className="grid grid-cols-3 gap-2">
              {PERIODS.map((p) => {
                const hasEntry = entries.some(e => e.period === p);
                return (
                  <button
                    key={p}
                    onClick={() => setSelectedPeriod(p)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-xl border transition-all duration-200 relative",
                      selectedPeriod === p
                        ? "border-white/30 bg-white/10 scale-105"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full mb-2"
                      style={{ backgroundColor: PERIOD_COLORS[p] }}
                    />
                    <span className="text-xs font-medium">{PERIOD_LABELS[p]}</span>
                    {hasEntry && (
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Émotion</label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300",
                    mood === m 
                      ? cn("border-transparent scale-110", getMoodColorClass(m))
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:scale-105"
                  )}
                >
                  <span className="text-2xl mb-1">{getMoodEmoji(m)}</span>
                  <span className="text-[10px] font-medium opacity-80">{getMoodLabel(m)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Énergie</label>
            <div className="grid grid-cols-5 gap-2">
              {ENERGY_STEPS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEnergy(e)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl border transition-all duration-200",
                    energy === e
                      ? "border-blue-500/50 bg-blue-500/20 text-blue-300"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                  )}
                >
                  <span className="text-lg mb-1">⚡</span>
                  <span className="text-xs font-medium">{e}%</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{consumptionLabel}</label>
            <div className="grid grid-cols-6 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((c) => (
                <button
                  key={c}
                  onClick={() => setConsumption(c)}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-xl border transition-all duration-200",
                    consumption === c
                      ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                      : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
                  )}
                >
                  <span className="text-xs font-bold">{c}</span>
                  <span className="text-[8px] opacity-70">{getConsumptionLabel(c)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note sur cette période..."
              className="w-full h-20 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-300"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
          {existingEntry ? (
            <Button 
              variant="outline" 
              onClick={handleDelete}
              disabled={isPending}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-white/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          ) : (
            <div />
          )}
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="min-w-[120px]">
              {isPending ? "Sauvegarde..." : existingEntry ? "Modifier" : "Enregistrer"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
