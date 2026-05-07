# Lun4rMood visual assets

Runtime app assets live at the `public/` root so Vite can serve them directly.
This `branding/` folder stays reserved for notes and future source/export
branding assets. Unused visual exports are archived under
`public/images/unused/`.

Current live hooks:

- Browser favicon: `artifacts/lunar-mood/index.html` -> `/favicon.png`
- Dashboard moon assets: `artifacts/lunar-mood/src/pages/Dashboard.tsx` -> `/moons/*.webp`
- Calendar moon miniatures: `artifacts/lunar-mood/src/components/calendar/moonPhaseEmojiAssets.ts` -> `/emoji/*.webp`
- Welcome icon: `artifacts/lunar-mood/src/App.tsx` -> `/icon-home.png`
- Welcome wordmark: `artifacts/lunar-mood/src/App.tsx` -> `/Typo_marketing.webp`

Store and launch exports:

- Marketing banner: `public/branding/store/feature_graphic.jpg`
- Store icon: `public/branding/store/app_icon_512.jpg`
- Splash icon: `public/splash/splash-icon.png`
- Adaptive icon copy: `public/icons/icon-512.png`

Runtime root files:

- `favicon.png` for the browser tab icon
- `manifest.json` is intentionally deferred until the app manifest pass

Asset folders:

- `/moons/` for Dashboard moon phase assets
- `/emoji/` for compact calendar moon markers
- `/images/unused/` for archived image files that are not imported by the app

Suggested future branding file names:

- `favicon/favicon-32.png`
- `favicon/favicon-180.png`
- `logo/settings-logo.png`
- `splash/login-splash.png`

Keep runtime assets at the `public/` root or in `/moons` and `/emoji` only when
the app imports them.
