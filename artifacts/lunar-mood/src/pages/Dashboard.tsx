import { useGetMe, useGetLunarPhases, useListMoods } from "@workspace/api-client-react"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent } from "@/components/ui/card"
import { AppLayout } from "@/components/layout/AppLayout"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { getMoodEmoji } from "@/lib/utils"
import { motion } from "framer-motion"

export default function Dashboard() {
  const { t, language } = useTranslation()
  const { data: user } = useGetMe()
  
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()
  const dateString = format(today, "yyyy-MM-dd")

  const { data: phases } = useGetLunarPhases({ month: currentMonth, year: currentYear })
  const { data: moods } = useListMoods({ month: currentMonth, year: currentYear })

  const phaseList = Array.isArray(phases)
    ? phases
    : Array.isArray((phases as any)?.data)
      ? (phases as any).data
      : Array.isArray((phases as any)?.items)
        ? (phases as any).items
        : []
  
  const moodList = Array.isArray(moods)
    ? moods
    : Array.isArray((moods as any)?.data)
      ? (moods as any).data
      : Array.isArray((moods as any)?.items)
        ? (moods as any).items
        : []
  
  const currentPhase = phaseList.find((p: any) => p.date === dateString) || phaseList[0]
  const todaysMoods = moodList.filter((m: any) => m.date === dateString)


  const phaseNames: Record<string, string> = {
    new_moon: "phaseNewMoon",
    waxing_crescent: "phaseWaxingCrescent",
    first_quarter: "phaseFirstQuarter",
    waxing_gibbous: "phaseWaxingGibbous",
    full_moon: "phaseFullMoon",
    waning_gibbous: "phaseWaningGibbous",
    last_quarter: "phaseLastQuarter",
    waning_crescent: "phaseWaningCrescent",
  }

  const phaseLabel = currentPhase ? t(phaseNames[currentPhase.phase]) || currentPhase.phase.replace("_", " ") : "..."

  return (
    <AppLayout>
      <div className="space-y-8 pt-4">
        <header>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            {t("hello")}, <span className="cosmic-gradient-text">{user?.username}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {format(today, "EEEE, d MMMM", { locale: language === "fr" ? fr : undefined })}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lunar Phase Card */}
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="relative overflow-hidden h-full">
              <img 
                src={`${import.meta.env.BASE_URL}images/moon-phases-illustration.png`}
                alt="Moon phases"
                className="absolute inset-0 w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <CardContent className="relative p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
                <span className="text-7xl mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  {currentPhase?.emoji || "🌑"}
                </span>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-widest mb-1">
                  {t("currentPhase")}
                </h3>
                <p className="text-2xl font-display font-bold text-white mb-2">{phaseLabel}</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white/80">
                  {t("illumination") || "Illumination"}: {Math.round((currentPhase?.illumination || 0) * 100)}%
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Summary */}
          <Card>
            <CardContent className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {t("todaySummary")}
              </h3>
              
              <div className="flex-1 flex flex-col gap-4">
              {(["morning", "afternoon", "evening"] as const).map((period) => {
                  const entry = todaysMoods.find((m: any) => m.period === period)
                  const periodColors: Record<string, string> = {
                    morning: "bg-[hsl(var(--period-morning))]/20 text-[hsl(var(--period-morning))]",
                    afternoon: "bg-[hsl(var(--period-afternoon))]/20 text-[hsl(var(--period-afternoon))]",
                    evening: "bg-[hsl(var(--period-evening))]/20 text-[hsl(var(--period-evening))]",
                  }

                  return (
                    <div key={period} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${periodColors[period]}`}>
                          {entry ? getMoodEmoji(entry.mood) : "—"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium capitalize text-sm sm:text-base">{t(period)}</p>
                          {entry && (
                            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate max-w-[80px] sm:max-w-[120px]">
                              {entry.note || ""}
                            </p>
                          )}
                        </div>
                      </div>
                      {entry ? (
                        <div className="text-right text-xs sm:text-sm text-muted-foreground flex gap-2 sm:gap-3 flex-shrink-0">
                          <span>⚡ {entry.energy}%</span>
                          <span>🍷 {entry.consumption}/5</span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm text-muted-foreground opacity-50 flex-shrink-0">{t("notLogged")}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
