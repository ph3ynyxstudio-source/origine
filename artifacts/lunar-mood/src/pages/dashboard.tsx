import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useListMoods, useGetLunarPhases, useGetMe } from "@workspace/api-client-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MoodDialog } from "@/components/calendar/mood-dialog";
import { getMoodColorClass, getMoodEmoji, cn } from "@/lib/utils";
import { Redirect } from "wouter";

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
    if (!moods.length) return { avgMood: 0, totalEntries: 0 };
    const total = moods.reduce((sum, m) => sum + m.mood, 0);
    return {
      avgMood: total / moods.length,
      totalEntries: moods.length
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
      <Sidebar stats={stats} />
      
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
                  const entry = moods.find(m => m.date === dateStr);
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
                        entry && "border-transparent"
                      )}
                    >
                      {/* Background color based on mood */}
                      {entry && (
                        <div className={cn("absolute inset-0 opacity-20", getMoodColorClass(entry.mood))} />
                      )}

                      <span className={cn(
                        "text-xs md:text-sm font-medium z-10",
                        !isCurrentMonth ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {format(date, 'd')}
                      </span>

                      <div className="flex flex-col items-center gap-1 z-10">
                        {phase && isCurrentMonth && (
                          <span className="text-lg md:text-2xl drop-shadow-lg opacity-80 group-hover:opacity-100 transition-opacity" title={phase.phase.replace('_', ' ')}>
                            {phase.emoji}
                          </span>
                        )}
                        
                        {entry && (
                          <div className={cn(
                            "absolute bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-lg border border-white/20",
                            getMoodColorClass(entry.mood)
                          )}>
                            <span className="text-[10px] md:text-xs">{getMoodEmoji(entry.mood)}</span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>

      <MoodDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        date={selectedDate}
        existingEntry={selectedDate ? moods.find(m => m.date === format(selectedDate, 'yyyy-MM-dd')) : undefined}
        lunarPhase={selectedDate ? lunarPhases.find(p => p.date === format(selectedDate, 'yyyy-MM-dd')) : undefined}
      />
    </div>
  );
}
