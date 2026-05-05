export type InputSignal = {
  autoTags: string[];
  score: number;
  summary: string;
  insight: string;
  suggestion: string;
};

export type ParserInput = {
  mood: number;
  energy: number;
  tags?: string[];
  note?: string | null;
};

const KEYWORD_TAGS: Array<{ tag: string; words: string[] }> = [
  { tag: "caffeine", words: ["cafe", "coffee", "espresso", "caffeine"] },
  { tag: "fatigue", words: ["fatigue", "fatiguee", "epuise", "tired", "exhausted"] },
  { tag: "stress", words: ["stress", "anxieux", "anxieuse", "anxiety", "pression", "tension"] },
  { tag: "sleep", words: ["sommeil", "dormi", "sleep", "nuit", "insomnie"] },
  { tag: "focus", words: ["focus", "concentre", "productif", "productive"] },
  { tag: "calm", words: ["calme", "peaceful", "relax", "repos", "stable"] },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeTags(tags: string[] = []): string[] {
  return unique(
    tags
      .map((tag) => normalizeText(tag).trim())
      .filter(Boolean),
  ).slice(0, 5);
}

export function parseInput(input: ParserInput): InputSignal {
  const mood = clampPercent(input.mood);
  const energy = clampPercent(input.energy);
  const tags = normalizeTags(input.tags);
  const note = input.note ?? "";
  const text = normalizeText(`${tags.join(" ")} ${note}`);
  const keywordTags = KEYWORD_TAGS.filter(({ words }) =>
    words.some((word) => text.includes(normalizeText(word))),
  ).map(({ tag }) => tag);
  const autoTags = normalizeTags([...tags, ...keywordTags]);
  const score = Math.round(mood * 0.6 + energy * 0.4);

  let summary = `Mood ${mood}% - energy ${energy}%`;
  let insight = "Signal stable, continue le suivi pour confirmer la tendance.";
  let suggestion = "Garde une note courte ce soir pour comparer demain.";

  const hasFatigue = autoTags.includes("fatigue");
  const hasCaffeine = autoTags.includes("caffeine");
  const hasStress = autoTags.includes("stress");

  if (hasFatigue && hasCaffeine) {
    summary = "Fatigue et caffeine detectees dans ton entree.";
    insight = "La caffeine semble liee a une energie instable aujourd'hui.";
    suggestion = "Essaie de reduire le cafe demain matin et observe l'energie.";
  } else if (hasFatigue || energy < 35) {
    summary = "Energie basse detectee.";
    insight = "Le signal du jour pointe vers de la recuperation prioritaire.";
    suggestion = "Prevois une routine plus calme avant le sommeil.";
  } else if (hasStress || mood < 40) {
    summary = "Tension emotionnelle detectee.";
    insight = "Le mood est sous la zone stable pour cette entree.";
    suggestion = "Note le declencheur principal avant de fermer l'app.";
  } else if (mood >= 70 && energy >= 60) {
    summary = "Bon alignement mood / energie.";
    insight = "Cette combinaison est utile comme reference positive.";
    suggestion = "Ajoute le contexte qui a aide aujourd'hui.";
  }

  return {
    autoTags,
    score,
    summary,
    insight,
    suggestion,
  };
}
