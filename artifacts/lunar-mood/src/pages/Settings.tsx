import { useTranslation } from "@/lib/i18n";

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="lunar-card w-full max-w-sm rounded-2xl p-6 space-y-6">
        {/* TITLE */}
        <h1 className="text-center text-lg font-semibold text-white">
          {t("settings")}
        </h1>

        {/* LANGUAGE */}
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10 gap-1">
          <button
            onClick={() => setLanguage("en")}
            className={`flex-1 py-2 text-sm rounded-md ${
              language === "en"
                ? "bg-[#7EEBFF]/20 border border-[#7EEBFF]/30 text-white"
                : "text-gray-400"
            }`}>
            English
          </button>

          <button
            onClick={() => setLanguage("fr")}
            className={`flex-1 py-2 text-sm rounded-md ${
              language === "fr"
                ? "bg-[#7EEBFF]/20 border border-[#7EEBFF]/30 text-white"
                : "text-gray-400"
            }`}>
            Français
          </button>
        </div>

        {/* FOOTER */}
        <div className="text-center text-xs text-gray-500">
          LUN4RMOOD © 2026
        </div>
      </div>
    </div>
  );
}
