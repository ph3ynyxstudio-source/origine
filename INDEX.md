# INDEX - Navigation LunarMood

Ce fichier est le point d'entree de navigation du depot.

App reelle a privilegier pour les analyses et modifications UI/code :

`artifacts/lunar-mood`

Les autres dossiers restent utiles comme contexte, mais ne doivent pas etre pris comme source principale de l'app web actuelle sans verification.

## Ordre de lecture recommande

1. `INDEX.md`
2. `AI_CONTEXT/README_IA.md`
3. `AI_CONTEXT/STYLE_GUIDE.md`
4. `AI_CONTEXT/RULES_MVP.md`
5. `artifacts/lunar-mood/UI_BOOKMARKS.md`
6. Code reel dans `artifacts/lunar-mood/src`

## Intention produit

Lun4rMood est une app d'introspection emotionnelle local-first.

Objectif principal :

- suivre emotion, energie et consommation
- saisir des donnees par moments de journee
- afficher une lecture simple des tendances personnelles
- relier l'experience aux phases lunaires

Ce n'est pas une app medicale, therapeutique ou diagnostique.

## Structure generale

| Chemin | Role |
| --- | --- |
| `artifacts/lunar-mood` | App web React + Vite actuelle. C'est le coeur du projet pour cette base. |
| `artifacts/lunar-mood-mobile` | Version mobile Expo / React Native. Contexte utile, mais pas l'app web reelle indiquee ici. |
| `artifacts/mockup-sandbox` | Sandbox de maquette / prototype. Ne pas confondre avec l'app web reelle. |
| `AI_CONTEXT` | Documentation d'intention IA, style, MVP et contexte UI/UX. |
| `lib/api-spec` | Spec OpenAPI historique / partagee. |
| `lib/api-client-react` | Client React Query genere depuis OpenAPI. Utilise seulement par `Login.tsx` dans l'app web actuelle. |
| `lib/api-zod` | Schemas Zod generes depuis OpenAPI. |
| `lib/db` | Schema Drizzle PostgreSQL historique / partage backend. Pas la source de stockage de l'app web locale actuelle. |
| `scripts` | Scripts utilitaires du workspace. |

## App web reelle: `artifacts/lunar-mood`

### Entree et shell

| Fichier | Sert a quoi |
| --- | --- |
| `artifacts/lunar-mood/src/main.tsx` | Point d'entree React. Monte `App` et enregistre le service worker PWA. |
| `artifacts/lunar-mood/src/App.tsx` | Providers globaux, ecran welcome, router Wouter, routes principales. |
| `artifacts/lunar-mood/src/components/layout/AppLayout.tsx` | Layout commun: sidebar desktop, bottom nav mobile, animation de page. |
| `artifacts/lunar-mood/src/index.css` | Theme global, variables CSS, styles Tailwind et classes visuelles communes. |

Routes actuellement montees :

| Route | Composant |
| --- | --- |
| `/` | `src/pages/Dashboard.tsx` |
| `/dashboard` | `src/pages/Dashboard.tsx` |
| `/calendar` | `src/pages/Calendar.tsx` |
| `/statistics` | `src/pages/Statistics.tsx` |
| `/settings` | `src/pages/Settings.tsx` |

Note : `src/pages/Login.tsx` existe, mais n'est pas route dans `src/App.tsx` actuellement.

## Donnees locales

| Fichier | Role |
| --- | --- |
| `src/data/day-entry.types.ts` | Types principaux: `DayEntry`, `MomentEntry`, `MomentKey`, `MoonPhase`, signaux normalises. |
| `src/data/storage.ts` | Lecture, ecriture et suppression des entrees dans `localStorage`. Ajoute aussi le snapshot lunaire lors de la sauvegarde. |
| `src/data/validator.ts` | Normalisation et validation defensive des donnees stockees. |
| `src/data/calendar.ts` | Dates locales: debut de jour, midi local, format `YYYY-MM-DD`, parsing, jours du mois. |
| `src/hooks/use-local-data-version.ts` | Force les vues a se rafraichir quand les donnees locales ou fallbacks changent. |
| `src/hooks/use-today.ts` | Garde la date du jour a jour au passage de minuit. |

Flux principal d'une saisie :

`QuickDayEntry.tsx` ou `MoodDialog.tsx`
-> construit un `DayEntry`
-> `saveDayEntry()` dans `src/data/storage.ts`
-> `validateDayEntry()` dans `src/data/validator.ts`
-> sauvegarde `localStorage` avec prefixe `lun4rmood:day:`
-> evenement `lun4rmood:local-data-updated`
-> rafraichissement via `useLocalDataVersion()`.

## Calcul lunaire

| Fichier | Role |
| --- | --- |
| `src/services/lunarEngine.ts` | Moteur principal: age lunaire, phase, illumination, jour du cycle. |
| `src/data/moon.ts` | Couche metier d'affichage: priorise les evenements exacts nouvelle/pleine lune depuis JSON, puis fallback vers `lunarEngine`. |
| `src/data/moonEvents.json` | Donnees d'evenements lunaires exacts. |
| `src/components/calendar/moonPhaseEmojiAssets.ts` | Mapping phase -> assets emoji du calendrier. |
| `src/components/getMoonPhaseIcon.tsx` | Mapping phase -> composant SVG. |
| `src/components/moon-phases.tsx` | Composants SVG des phases lunaires. |

Flux lunaire courant :

- `Dashboard.tsx` appelle `getMoonPhase(today)` depuis `src/data/moon.ts`.
- `Dashboard.tsx` appelle `getLunarCycleDay(toLocalNoon(today))` depuis `src/services/lunarEngine.ts`.
- `CalendarGrid.tsx` appelle `getExactMoonEventPhase()`, `getMoonPhase()` et `getLunarCyclePosition()` pour choisir les marqueurs nouvelle/pleine lune.
- `Statistics.tsx` associe chaque point de donnees a une phase lunaire via `getExactMoonEventPhase()` puis `entry.moonPhase` puis `getMoonPhase()`.

## Calcul des metriques

| Fichier | Calcul |
| --- | --- |
| `src/pages/Dashboard.tsx` | Moyenne du jour pour `emotion` et `energy` via `getAverageMetric(entry, key)`. |
| `src/pages/Statistics.tsx` | Donnees des 7 derniers jours, moyennes emotion/energie/consommation, score de phase lunaire, tendance globale. |
| `src/data/devSeed.ts` | Generation de fausses donnees locales DEV sur plusieurs jours. |
| `src/data/validator.ts` | Clamp et nettoyage des valeurs numeriques entre 0 et 100. |

Details importants :

- Les valeurs utilisateur sont stockees sur une echelle `0..100`.
- Les donnees sont organisees par jour, puis par moment: `morning`, `midday`, `evening`.
- Les stats actuelles sont calculees cote client dans `Statistics.tsx`, pas via endpoint serveur.

## System insight

| Fichier | Role |
| --- | --- |
| `src/core/Core/crystaph3y/engine.ts` | Point prevu pour le moteur d'analyse `analyzeHistory()`. Actuellement stub: renvoie `Test Crystaph3y actif`. |
| `src/pages/Dashboard.tsx` | Appelle `analyzeHistory()`, puis utilise un fallback local si le moteur renvoie le texte de test. |
| `src/lib/i18n.tsx` | Contient les textes d'insight fallback: `insightStartLogging`, `insightLowMoodLowEnergy`, etc. |

Flux insight actuel :

`Dashboard.tsx`
-> calcule humeur/energie du jour
-> appelle `analyzeHistory()`
-> si le moteur renvoie autre chose que `Test Crystaph3y actif`, affiche cet insight
-> sinon choisit un texte fallback via `getFallbackInsightKey(mood, energy)`
-> traduit le texte avec `t(...)` depuis `src/lib/i18n.tsx`.

Conseil : si tu veux rendre les insights plus intelligents, le point naturel est `src/core/Core/crystaph3y/engine.ts`, puis verifier l'affichage dans `src/pages/Dashboard.tsx`.

## Ecrans principaux

| Fichier | Role |
| --- | --- |
| `src/pages/Dashboard.tsx` | Home: phase lunaire, jour du cycle, capture rapide, humeur/energie du jour, insight. |
| `src/pages/QuickDayEntry.tsx` | Saisie rapide des trois moments et trois metriques: emotion, energie, consommation. Tags consommation. |
| `src/pages/Calendar.tsx` | Page calendrier: navigation mois precedent/suivant, ouverture du journal. |
| `src/components/calendar/CalendarGrid.tsx` | Construction de la grille mensuelle et selection des marqueurs lune. |
| `src/components/calendar/DayCell.tsx` | Tuile d'un jour: numero, icone lune, points de presence matin/midi/soir. |
| `src/pages/MoodDialog.tsx` | Journal textuel d'une date. Normalise quelques mots de note vers tags simples. |
| `src/pages/Statistics.tsx` | Graphique 7 jours, moyennes, tendance, phase lunaire. |
| `src/pages/Settings.tsx` | Langue, theme, liens legaux, outils DEV, seed et fallbacks. |
| `src/pages/Login.tsx` | Login/register via client API genere. Non branche dans le router actuel. |
| `src/pages/not-found.tsx` | Ecran 404 minimal. Non branche explicitement dans le router actuel. |

## UI, theme et textes

| Fichier | Role |
| --- | --- |
| `src/lib/i18n.tsx` | Traductions EN/FR et provider `I18nProvider`. |
| `src/lib/theme.tsx` | Theme light/dark persiste dans `localStorage`. |
| `src/lib/utils.ts` | Helper `cn()` pour classes Tailwind. |
| `src/components/ui/*` | Primitives UI type shadcn/Radix. A eviter comme point d'entree metier. |
| `src/index.css` | Variables design system, styles globaux, classes comme `lunar-card`. |

## Assets visuels

| Chemin | Role |
| --- | --- |
| `artifacts/lunar-mood/public/icon-home.png` | Logo/icone principale de l'ecran welcome. |
| `artifacts/lunar-mood/public/Typo_marketing.webp` | Typographie/wordmark marketing affichee au welcome. |
| `artifacts/lunar-mood/public/moons/*.webp` | Images principales de phases lunaires. |
| `artifacts/lunar-mood/public/emoji/*.webp` | Petites icones de phases pour le calendrier. |
| `artifacts/lunar-mood/public/branding/*` | Assets branding/store. |
| `artifacts/lunar-mood/public/manifest.json` | Manifest PWA. |
| `artifacts/lunar-mood/public/icons/*` | Icones PWA. |
| `artifacts/lunar-mood/public/splash/*` | Splash assets. |

## DEV et fallbacks

| Fichier | Role |
| --- | --- |
| `src/data/devFallbacks.ts` | Active des simulations DEV: phase inconnue, donnees absentes/corrompues, echec ecriture, stats vides. |
| `src/data/devSeed.ts` | Genere et efface des donnees fictives locales. |
| `src/pages/Settings.tsx` | Interface des outils DEV, visible seulement en `import.meta.env.DEV`. |

## Backend, API et schemas partages

Ces fichiers existent, mais l'app web actuelle observee fonctionne surtout en local-first via `localStorage`.

| Fichier | Role |
| --- | --- |
| `lib/api-spec/openapi.yaml` | Contrat OpenAPI: auth, moods, lunar, stats. |
| `lib/api-client-react/src/generated/api.ts` | Hooks React Query generes par Orval. |
| `lib/api-client-react/src/custom-fetch.ts` | Fetch custom, credentials inclus, base URL optionnelle, token optionnel. |
| `lib/api-zod/src/generated/*` | Schemas/types Zod generes. |
| `lib/db/src/schema/moods.ts` | Schema Drizzle pour table `moods`. |
| `lib/db/src/schema/users.ts` | Schema Drizzle pour table `users`. |

Point d'attention : `src/pages/Login.tsx` utilise `@workspace/api-client-react`, mais le login n'est pas route dans `src/App.tsx`.

## Mobile Expo

| Chemin | Role |
| --- | --- |
| `artifacts/lunar-mood-mobile/app` | Routes Expo Router. |
| `artifacts/lunar-mood-mobile/contexts` | Contextes auth, mood, settings. |
| `artifacts/lunar-mood-mobile/lib` | Logique mobile: lunar, i18n, input parser, mood metrics. |
| `artifacts/lunar-mood-mobile/components` | Composants visuels mobile. |
| `artifacts/lunar-mood-mobile/assets` | Assets mobile. |

Ne pas modifier la version mobile si la demande cible l'app web `artifacts/lunar-mood`.

## Fichiers vides ou en attente

| Fichier | Etat observe |
| --- | --- |
| `src/core/Core/createEntry.ts` | Vide actuellement. |
| `src/core/Core/normalize.ts` | Vide actuellement. |
| `src/components/lunar/LunarDashboard.tsx` | Vide actuellement. |
| `AI_CONTEXT/UI_UX_BOOKMARKS.md` | Vide actuellement. |

## Ecarts documentation / implementation observes

Ces points sont signales pour navigation. Ne pas les corriger automatiquement sans demande explicite.

- `replit.md` mentionne `artifacts/api-server`, mais ce dossier n'apparait pas dans le depot actuel.
- `replit.md` decrit des endpoints serveur et un stockage PostgreSQL, alors que l'app web actuelle utilise surtout `localStorage`.
- `artifacts/lunar-mood/requirements.yaml` mentionne des images sous `public/images/*`, mais les assets observes sont plutot directement sous `public/`, `public/moons`, `public/emoji`, `public/branding`, etc.
- `artifacts/lunar-mood/UI_BOOKMARKS.md` contient des chemins absolus qui semblent provenir d'un ancien chemin avec `PH3Y NYX`; le depot courant est sous `PH3YNYX_Projects`.
- `src/pages/Login.tsx` existe et utilise le client API, mais n'est pas branche dans le router actuel.
- Le moteur d'insight `src/core/Core/crystaph3y/engine.ts` est actuellement un stub.

## Commandes utiles

Depuis la racine du depot :

```powershell
pnpm --filter @workspace/lunar-mood dev
pnpm --filter @workspace/lunar-mood typecheck
pnpm --filter @workspace/lunar-mood build
```

Depuis `artifacts/lunar-mood` :

```powershell
pnpm run dev
pnpm run typecheck
pnpm run build
```

Note Windows/Codex : `artifacts/COMMANDE.MD` signale que `esbuild` peut parfois echouer avec `spawn EPERM` dans le sandbox Codex; dans ce cas, verifier dans PowerShell local avant de conclure a un bug applicatif.

