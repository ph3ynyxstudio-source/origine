import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getMoodColorClass, getMoodEmoji, getMoodLabel, cn } from "@/lib/utils";
import type { MoodEntry, LunarPhase } from "@workspace/api-client-react";
import { useAppMoods } from "@/hooks/use-app-state";
import { Trash2 } from "lucide-react";

interface MoodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  existingEntry?: MoodEntry;
  lunarPhase?: LunarPhase;
}

export function MoodDialog({ isOpen, onClose, date, existingEntry, lunarPhase }: MoodDialogProps) {
  const [mood, setMood] = useState<number>(3);
  const [note, setNote] = useState<string>("");
  const { createMood, updateMood, deleteMood } = useAppMoods();

  useEffect(() => {
    if (existingEntry) {
      setMood(existingEntry.mood);
      setNote(existingEntry.note || "");
    } else {
      setMood(3);
      setNote("");
    }
  }, [existingEntry, isOpen]);

  const handleSave = () => {
    if (!date) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    if (existingEntry) {
      updateMood.mutate(
        { id: existingEntry.id, data: { mood, note: note || null } },
        { onSuccess: onClose }
      );
    } else {
      createMood.mutate(
        { data: { date: formattedDate, mood, note: note || null } },
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
      <DialogContent>
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

        <div className="py-6 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">How was your orbit today?</label>
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
                  <span className="text-2xl mb-2">{getMoodEmoji(m)}</span>
                  <span className="text-[10px] font-medium opacity-80">{getMoodLabel(m)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Captain's Log</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record your thoughts on today's journey..."
              className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-300"
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
              Erase
            </Button>
          ) : (
            <div /> // Spacer
          )}
          
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending} className="min-w-[120px]">
              {isPending ? "Saving..." : existingEntry ? "Update Log" : "Seal Log"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
