<div className="flex bg-black/40 rounded-lg p-1 border border-white/10 gap-1">
  <button
    onClick={() => setLanguage("en")}
    className={`flex-1 min-w-0 px-2 py-1 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 active:scale-95 truncate ${
      language === "en"
        ? "bg-[#7EEBFF]/20 border border-[#7EEBFF]/30 text-white"
        : "text-muted-foreground hover:text-white"
    }`}>
    English
  </button>

  <button
    onClick={() => setLanguage("fr")}
    className={`flex-1 min-w-0 px-2 py-1 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 active:scale-95 truncate ${
      language === "fr"
        ? "bg-[#7EEBFF]/20 border border-[#7EEBFF]/30 text-white"
        : "text-muted-foreground hover:text-white"
    }`}>
    Français
  </button>
</div>;
