import { useTranslation } from "@/lib/i18n";
import { useThemeMode, type ThemeMode } from "@/lib/theme";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

const LEGAL_URL = "https://ph3ynyxstudio-source.github.io/Legal/Index.html";

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
      <div className="lunar-card w-full max-w-sm rounded-2xl p-6 space-y-6">
        {/* TITLE */}
        <h1 className="text-center text-lg font-semibold text-foreground">
          {t("settings")}
        </h1>

        {/* LANGUAGE */}
        <div className="flex bg-muted rounded-lg p-1 border border-border gap-1">
          <button
            onClick={() => setLanguage("en")}
            className={`flex-1 py-2 text-sm rounded-md ${
              language === "en"
                ? "bg-primary/15 border border-primary/30 text-foreground"
                : "text-muted-foreground"
            }`}>
            English
          </button>

          <button
            onClick={() => setLanguage("fr")}
            className={`flex-1 py-2 text-sm rounded-md ${
              language === "fr"
                ? "bg-primary/15 border border-primary/30 text-foreground"
                : "text-muted-foreground"
            }`}>
            Français
          </button>
        </div>

        {/* THEME */}
        <div className="flex bg-muted rounded-lg p-1 border border-border gap-1">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setThemeMode(option.value)}
              className={`flex-1 py-2 text-sm rounded-md ${
                themeMode === option.value
                  ? "bg-primary/15 border border-primary/30 text-foreground"
                  : "text-muted-foreground"
              }`}>
              {option.label}
            </button>
          ))}
        </div>

        {/* LEGAL */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            {t("legal")}
          </p>
          <div className="grid gap-2">
            <a
              href={LEGAL_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[rgba(244,190,160,0.22)] bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/25 hover:text-foreground"
            >
              {t("privacyPolicy")}
            </a>
            <a
              href={LEGAL_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[rgba(244,190,160,0.22)] bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/25 hover:text-foreground"
            >
              {t("legalNotice")}
            </a>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs text-muted-foreground">
          LUN4RMOOD © 2026
        </div>
      </div>
    </div>
  );
}
