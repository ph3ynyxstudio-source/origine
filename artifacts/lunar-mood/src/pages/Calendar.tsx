import { useState } from "react"
import { useListMoods, useGetLunarPhases } from "@workspace/api-client-react"
import { useTranslation } from "@/lib/i18n"
import { AppLayout } from "@/components/layout/AppLayout"
import { format, startOfMonth, getDaysInMonth, getDay, subMonths, addMonths } from "date-fns"
import { fr } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { MoodDialog } from "./MoodDialog"

export default function Calendar() {
  const { t, language } = useTranslation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null)
  
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()
  
  const { data: moods } = useListMoods({ month, year })
  const { data: phases } = useGetLunarPhases({ month, year })
  const moodList = Array.isArray(moods) ? moods : [];

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getDay(startOfMonth(currentDate))
  
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  })

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const periodColors: Record<string, string> = {
    morning: "bg-[hsl(var(--period-morning))]",
    afternoon: "bg-[hsl(var(--period-afternoon))]",
    evening: "bg-[hsl(var(--period-evening))]",
  }
  const phaseIcons: Record<string, string> = {
    new_moon: "🌑",
    waxing_crescent: "🌒",
    first_quarter: "🌓",
    waxing_gibbous: "🌔",
    full_moon: "🌕",
    waning_gibbous: "🌖",
    last_quarter: "🌗",
    waning_crescent: "🌘",
  }
  return (
    <AppLayout>
      <div className="pt-4 space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            {t("calendar")}
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 bg-white/5 rounded-full p-1 border border-white/10 w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-base sm:text-lg min-w-[100px] sm:min-w-[120px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: language === "fr" ? fr : undefined })}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="glass-panel p-3 sm:p-6 rounded-2xl sm:rounded-3xl">
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4 text-center">
            {(["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const).map(d => (
              <div key={d} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t(d)}
              </div>
            ))}
          </div>
          
          <motion.div 
            key={currentDate.toISOString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3"
          >
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-white/2" />
            ))}
            
            {days.map((dateStr) => {
              const dayMoods = moodList.filter(m => m.date === dateStr) || []
              const phase = phases?.find(p => p.date === dateStr)
              const illumination = Math.round((phase?.illumination || 0) * 100)
              const dayNum = parseInt(dateStr.split('-')[2])
              const isToday = dateStr === format(new Date(), "yyyy-MM-dd")

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`relative aspect-square rounded-lg sm:rounded-2xl border transition-all flex flex-col items-center justify-center p-0.5 sm:p-1 hover:scale-105
                    ${isToday ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(124,106,250,0.2)]' : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
                >
               <span className={`absolute bottom-1 sm:bottom-1.5 z-10 px-1 rounded-full text-[10px] sm:text-xs font-medium shadow-[0_0_8px_rgba(0,0,0,0.55)] ${isToday ? 'text-primary bg-black/40' : 'text-white bg-black/45'}`}>
  {dayNum}
</span>
                  
                  {phase && (
  <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
    <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-[0_0_18px_rgba(168,139,250,0.35)]">
      <span className="text-1g sm:text-xl leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]">
        {phase.emoji}
      </span>
    </div>
  </div>
)}
                  

                  <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 flex justify-center gap-0.5 sm:gap-1">
                    {["morning", "afternoon", "evening"].map((period) => {
                      const hasEntry = dayMoods.some(m => m.period === period)
                      return (
                        <div 
                          key={period} 
                          className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${hasEntry ? periodColors[period] : 'bg-transparent'}`}
                        />
                      )
                    })}
                  </div>
                </button>
              )
            })}
          </motion.div>
        </div>

        <div className="flex justify-center gap-6 text-sm text-muted-foreground pt-4">
          <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${periodColors.morning}`} />{t("morning")}</div>
          <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${periodColors.afternoon}`} />{t("afternoon")}</div>
          <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${periodColors.evening}`} />{t("evening")}</div>
        </div>
      </div>

      <AnimatePresence>
        {selectedDateStr && (
          <MoodDialog 
            date={selectedDateStr} 
            existingEntries={moods?.filter(m => m.date === selectedDateStr) || []}
            onClose={() => setSelectedDateStr(null)}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  )
}
