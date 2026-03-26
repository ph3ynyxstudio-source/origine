import { useGetMe, useLogout } from "@workspace/api-client-react"
import { useTranslation } from "@/lib/i18n"
import { AppLayout } from "@/components/layout/AppLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoonStar, LogOut, Globe } from "lucide-react"

export default function Settings() {
  const { t, language, setLanguage } = useTranslation()
  const { data: user } = useGetMe()
  const logoutMutation = useLogout()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      window.location.href = import.meta.env.BASE_URL
    } catch (e) {
      console.error("Logout failed", e)
    }
  }

  return (
    <AppLayout>
      <div className="pt-4 space-y-8 max-w-2xl mx-auto">
        <header>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
            {t("settings")}
          </h1>
        </header>

        <Card>
          <CardContent className="p-0 divide-y divide-white/10">
            {/* Profile Section */}
            <div className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="text-2xl font-bold text-primary">
                  {user?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{user?.username}</h3>
                <p className="text-muted-foreground text-sm">{t("astronaut")}</p>
              </div>
            </div>

            {/* Language */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{t("language")}</span>
              </div>
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    language === "en" ? "bg-white/10 text-white shadow" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {t("english")}
                </button>
                <button
                  onClick={() => setLanguage("fr")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    language === "fr" ? "bg-white/10 text-white shadow" : "text-muted-foreground hover:text-white"
                  }`}
                >
                  {t("french")}
                </button>
              </div>
            </div>

            {/* App Info */}
            <div className="p-6 flex flex-col items-center justify-center text-center space-y-2 pb-12">
              <MoonStar className="w-8 h-8 text-white/20 mb-2" />
              <h4 className="font-display text-lg tracking-wider text-white/50">LunarMood</h4>
              <p className="text-sm text-white/30 tracking-widest">© 2026 Mo</p>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="destructive" 
          className="w-full h-14 text-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
          onClick={handleLogout}
          isLoading={logoutMutation.isPending}
        >
          <LogOut className="w-5 h-5 mr-2" />
          {t("logout")}
        </Button>
      </div>
    </AppLayout>
  )
}
