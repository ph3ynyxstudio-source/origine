# Lun4rMood visual assets

Runtime app assets live at the `public/` root so Vite can serve them directly.
This `branding/` folder stays reserved for source/export branding assets and
future marketplace visuals.

Current live hooks:

- Browser favicon: `artifacts/lunar-mood/index.html` -> `/favicon.png`
- Dashboard moon assets: `artifacts/lunar-mood/src/pages/Dashboard.tsx` -> `/moons/*.webp`
- Calendar moon miniatures: `artifacts/lunar-mood/src/components/calendar/moonPhaseEmojiAssets.ts` -> `/emoji/*.webp`
- Login splash image: `artifacts/lunar-mood/src/pages/Login.tsx` -> `images/splash-icon.png`

Runtime root files:

- `favicon.png` for the browser tab icon
- `icon-foreground.png` for the transparent phoenix foreground, planned for app/store icon work
- `icon-background.png` for the solid night-blue background, planned for app/store icon work
- `manifest.json` is intentionally deferred until the app manifest pass

Asset folders:

- `/moons/` for Dashboard moon phase assets
- `/emoji/` for compact calendar moon markers
- `/branding/favicon/` for browser favicon exports
- `logo/` for app logo files used in settings or other brand surfaces
- `splash/` for splash or launch branding exports
- `store/` for marketplace/store visuals that should stay separate from runtime assets

Suggested future branding file names:

- `favicon/favicon-32.png`
- `favicon/favicon-180.png`
- `logo/settings-logo.png`
- `splash/login-splash.png`

Keep Play Store marketing exports in `store/`. Keep runtime assets at the
`public/` root or in `/moons` and `/emoji` only when the app imports them.
