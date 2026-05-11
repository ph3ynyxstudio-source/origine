import { useTranslation } from "@/lib/i18n";
import {
  DEV_FALLBACK_KEYS,
  getDevFallbackState,
  resetDevFallbacks,
  setDevFallback,
  type DevFallbackKey,
} from "@/data/devFallbacks";
import { useThemeMode, type ThemeMode } from "@/lib/theme";
import { toast } from "@/hooks/use-toast";
import { clearDevSeedData, generateDevSeedData } from "@/data/devSeed";
import { useLocalDataVersion } from "@/hooks/use-local-data-version";

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

const LEGAL_URL = "https://ph3ynyxstudio-source.github.io/Legal/Index.html";
const DEV_FALLBACK_LABELS: Record<DevFallbackKey, string> = {
  unknown_lunar_phase: "devUnknownLunarPhase",
  missing_local_data: "devMissingLocalData",
  corrupted_local_data: "devCorruptedLocalData",
  storage_write_failure: "devStorageWriteFailure",
  empty_statistics: "devEmptyStatistics",
};

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();
  const { themeMode, setThemeMode } = useThemeMode();
  const isDev = import.meta.env.DEV;
  useLocalDataVersion();
  const devFallbackState = getDevFallbackState();

  function handleGenerateDevData() {
    const result = generateDevSeedData();
    toast({
      title: t("devDataCreated"),
      description:
        result.skipped > 0
          ? `${result.created} | ${t("devDataSkipped")}: ${result.skipped}`
          : String(result.created),
    });
  }

  function handleClearDevData() {
    const cleared = clearDevSeedData();
    toast({
      title: cleared > 0 ? t("devDataCleared") : t("devDataNothingToClear"),
      description: String(cleared),
    });
  }

  function handleToggleDevFallback(key: DevFallbackKey) {
    const nextEnabled = devFallbackState[key] !== true;
    setDevFallback(key, nextEnabled);
    toast({
      title: t(nextEnabled ? "devFallbackEnabled" : "devFallbackDisabled"),
      description: t(DEV_FALLBACK_LABELS[key]),
    });
  }

  function handleResetDevFallbacks() {
    resetDevFallbacks();
    toast({
      title: t("devFallbacksReset"),
      description: t("devFallbacksHint"),
    });
  }

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

        {isDev && (
          <div className="space-y-3 rounded-xl border border-cyan-300/20 bg-linear-to-r from-cyan-300/8 via-violet-400/8 to-transparent p-4 shadow-[0_0_22px_rgba(34,211,238,0.08)]">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
                {t("devTools")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("devDataHint")}
              </p>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={handleGenerateDevData}
                className="rounded-lg border border-cyan-300/28 bg-cyan-300/10 px-3 py-2 text-sm text-foreground transition-colors hover:border-cyan-200/40 hover:bg-cyan-300/14"
              >
                {t("generateDevData")}
              </button>
              <button
                type="button"
                onClick={handleClearDevData}
                className="rounded-lg border border-violet-300/22 bg-violet-300/10 px-3 py-2 text-sm text-foreground transition-colors hover:border-violet-200/36 hover:bg-violet-300/14"
              >
                {t("clearDevData")}
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
                {t("devFallbacks")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("devFallbacksHint")}
              </p>
              <div className="grid gap-2">
                {DEV_FALLBACK_KEYS.map((key) => {
                  const enabled = devFallbackState[key] === true;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleToggleDevFallback(key)}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        enabled
                          ? "border-cyan-300/30 bg-cyan-300/12 text-foreground"
                          : "border-border bg-muted text-muted-foreground hover:border-primary/25 hover:text-foreground"
                      }`}
                    >
                      {t(DEV_FALLBACK_LABELS[key])}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={handleResetDevFallbacks}
                  className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/25 hover:text-foreground"
                >
                  {t("devFallbacksReset")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="text-center text-xs text-muted-foreground">
          LUN4RMOOD © 2026
        </div>
      </div>
    </div>
  );
}
