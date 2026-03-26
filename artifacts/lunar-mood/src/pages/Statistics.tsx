import { useGetStats } from "@workspace/api-client-react"
import { useTranslation } from "@/lib/i18n"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"

export default function Statistics() {
  const { t } = useTranslation()
  const { data: stats, isLoading } = useGetStats()

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center pt-32">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    )
  }

  if (!stats || stats.totalEntries === 0) {
    return (
      <AppLayout>
        <div className="h-full flex flex-col items-center justify-center pt-32 text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">{t("noDataYet")}</h2>
        </div>
      </AppLayout>
    )
  }

  const phaseEmojis: Record<string, string> = {
    new_moon: "🌑",
    waxing_crescent: "🌒",
    first_quarter: "🌓",
    waxing_gibbous: "🌔",
    full_moon: "🌕",
    waning_gibbous: "🌖",
    last_quarter: "🌗",
    waning_crescent: "🌘",
  }

  const phaseTranslations: Record<string, string> = {
    new_moon: "phaseNewMoon",
    waxing_crescent: "phaseWaxingCrescent",
    first_quarter: "phaseFirstQuarter",
    waxing_gibbous: "phaseWaxingGibbous",
    full_moon: "phaseFullMoon",
    waning_gibbous: "phaseWaningGibbous",
    last_quarter: "phaseLastQuarter",
    waning_crescent: "phaseWaningCrescent",
  }

  const formattedPhaseData = stats.byPhase.map(p => ({
    ...p,
    name: `${phaseEmojis[p.phase] || ""} ${t(phaseTranslations[p.phase]) || p.phase}`,
    mood: p.avgMood,
    energy: p.avgEnergy,
    conso: p.avgConsumption
  }))

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/90 backdrop-blur border border-white/10 p-3 rounded-lg shadow-xl">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="text-sm">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="pt-4 space-y-8">
        <header>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {t("statistics")}
          </h1>
          <p className="text-muted-foreground">{stats.totalEntries} {t("entries")} {t("logged")}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("emotionByPhase")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedPhaseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="rgba(255,255,255,0.3)" domain={[0, 5]} ticks={[1,2,3,4,5]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="mood" name={t("emotion")} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("energyByPhase")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedPhaseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="rgba(255,255,255,0.3)" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="energy" name={t("energy")} fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("consumptionByPhase")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedPhaseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis stroke="rgba(255,255,255,0.3)" domain={[0, 5]} ticks={[0,1,2,3,4,5]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="conso" name={t("conso")} fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("monthlyTrends")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.3)" domain={[0, 5]} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.3)" domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line yAxisId="left" type="monotone" dataKey="avgMood" name={t("emotion")} stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: "hsl(var(--primary))"}} />
                  <Line yAxisId="left" type="monotone" dataKey="avgConsumption" name={t("conso")} stroke="hsl(0, 84%, 60%)" strokeWidth={3} dot={{r: 4}} />
                  <Line yAxisId="right" type="monotone" dataKey="avgEnergy" name={t("energy")} stroke="hsl(var(--accent))" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
