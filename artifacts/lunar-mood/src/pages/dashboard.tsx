import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useListMoods, useGetLunarPhases, useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { MoodDialog } from "@/components/calendar/mood-dialog";
import { getMoodColorClass, PERIOD_COLORS, PERIOD_LABELS, cn } from "@/lib/utils";
import { Redirect } from "wouter";

const PERIODS = ["morning", "afternoon", "evening"] as const;

export default function DashboardPage() {
  const { data: user, isError, isLoading: isUserLoading } = useGetMe({ query: { retry: false } });
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const month = currentMonth.getMonth() + 1;
  const year = currentMonth.getFullYear();

  const { data: moods = [] } = useListMoods({ month, year }, { query: { enabled: !!user } });
  const { data: lunarPhases = [] } = useGetLunarPhases({ month, year }, { query: { enabled: !!user } });

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const stats = useMemo(() => {
    if (!moods.length) return { avgMood: 0, avgEnergy: 0, avgConsumption: 0, totalEntries: 0 };
    const totalMood = moods.reduce((sum, m) => sum + m.mood, 0);
    const totalEnergy = moods.reduce((sum, m) => sum + m.energy, 0);
    const totalConsumption = moods.reduce((sum, m) => sum + m.consumption, 0);
    return {
      avgMood: totalMood / moods.length,
      avgEnergy: Math.round(totalEnergy / moods.length),
      avgConsumption: Math.round((totalConsumption / moods.length) * 10) / 10,
      totalEntries: moods.length,
    };
  }, [moods]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const openDialog = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  if (isUserLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;
  }

  if (isError || !user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      <Sidebar stats={stats} consumptionLabel={user.consumptionLabel || "Café"} />
      
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <header className="flex items-center justify-between glass-panel p-4 md:p-6 rounded-3xl">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-full bg-white/5 hover:bg-white/10">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-2xl md:text-3xl font-display font-semibold w-48 text-center">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-full bg-white/5 hover:bg-white/10">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="hidden md:flex items-center gap-3 bg-black/20 px-6 py-3 rounded-2xl border border-white/5">
               <span className="text-sm text-muted-foreground">Current Phase:</span>
               {lunarPhases.find(p => p.date === format(new Date(), 'yyyy-MM-dd'))?.emoji || "✨"}
               <span className="text-sm font-medium capitalize">
                 {lunarPhases.find(p => p.date === format(new Date(), 'yyyy-MM-dd'))?.phase.replace('_', ' ') || "Unknown"}
               </span>
            </div>
          </header>

          <div className="glass rounded-3xl p-4 md:p-8">
            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4">
              <AnimatePresence mode="popLayout">
                {daysInMonth.map((date, i) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const dayEntries = moods.filter(m => m.date === dateStr);
                  const phase = lunarPhases.find(p => p.date === dateStr);

                  return (
                    <motion.button
                      key={dateStr}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.01 }}
                      onClick={() => isCurrentMonth && openDialog(date)}
                      disabled={!isCurrentMonth}
                      className={cn(
                        "relative flex flex-col items-center justify-between aspect-square p-2 md:p-3 rounded-2xl border transition-all duration-300 overflow-hidden group",
                        !isCurrentMonth ? "opacity-30 border-transparent cursor-default" : "border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/20 cursor-pointer",
                        isToday(date) && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                        dayEntries.length > 0 && "border-transparent"
                      )}
                    >
                      {dayEntries.length > 0 && (
                        <div className={cn("absolute inset-0 opacity-10", getMoodColorClass(dayEntries[0].mood))} />
                      )}

                      <span className={cn(
                        "text-xs md:text-sm font-medium z-10",
                        !isCurrentMonth ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {format(date, 'd')}
                      </span>

                      <div className="flex flex-col items-center gap-1 z-10">
                        {phase && isCurrentMonth && (
                          <span className="text-sm md:text-lg drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity" title={phase.phase.replace('_', ' ')}>
                            {phase.emoji}
                          </span>
                        )}
                        
                        {dayEntries.length > 0 && (
                          <div className="flex gap-1">
                            {PERIODS.map((p) => {
                              const entry = dayEntries.find(e => e.period === p);
                              return (
                                <div
                                  key={p}
                                  className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
                                  style={{
                                    backgroundColor: entry ? PERIOD_COLORS[p] : "transparent",
                                    border: entry ? "none" : "1px solid rgba(255,255,255,0.15)",
                                  }}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 md:p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Légende</h3>
            <div className="flex flex-wrap gap-6">
              {PERIODS.map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PERIOD_COLORS[p] }} />
                  <span className="text-sm text-muted-foreground">{PERIOD_LABELS[p]}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">Consommation:</span>
                <span className="text-sm font-medium">{user.consumptionLabel || "Café"}</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <MoodDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        date={selectedDate}
        entries={selectedDate ? moods.filter(m => m.date === format(selectedDate, 'yyyy-MM-dd')) : []}
        lunarPhase={selectedDate ? lunarPhases.find(p => p.date === format(selectedDate, 'yyyy-MM-dd')) : undefined}
        consumptionLabel={user.consumptionLabel || "Café"}
      />
    </div>
  );
}
