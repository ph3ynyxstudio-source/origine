import { useTranslation } from "@/lib/i18n";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { MoonStar, Globe } from "lucide-react";

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <AppLayout>
      <div className="pt-4 space-y-8 max-w-2xl mx-auto">
        <header>
          <h1 className="text-2xl font-display font-bold text-white mb-2">
            {t("settings")}
          </h1>
        </header>

        <Card>
          <CardContent className="p-0 divide-y divide-white/10">
            <div className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <span className="text-2xl font-bold text-primary">🌙</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">LunarMood</h3>
                <p className="text-muted-foreground text-sm">
                  {t("astronaut")}
                </p>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{t("language")}</span>
              </div>
              <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    language === "en"
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("fr")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    language === "fr"
                      ? "bg-white/10 text-white"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  Français
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col items-center text-center space-y-2 pb-12">
              <MoonStar className="w-8 h-8 text-white/20 mb-2" />
              <h4 className="font-display text-lg tracking-wider text-white/50">
                LunarMood
              </h4>
              <p className="text-sm text-white/30">© 2026</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
