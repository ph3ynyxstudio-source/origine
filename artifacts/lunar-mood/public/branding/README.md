# Lun4rMood web branding assets

This folder is reserved for future web branding files. Do not commit generated placeholders here.

Current live hooks:
- Favicon: `artifacts/lunar-mood/index.html` -> `/favicon-v2.png`
- Login splash image: `artifacts/lunar-mood/src/pages/Login.tsx` -> `images/splash-icon.png`
- Settings logo slot: `artifacts/lunar-mood/src/pages/Settings.tsx` currently uses an emoji badge and can later receive a real logo asset without changing page structure.

Recommended drop zones:
- `favicon/` for browser favicon exports
- `logo/` for app logo files used in settings or other brand surfaces
- `splash/` for splash or launch branding exports
- `store/` for marketplace/store visuals that should stay separate from runtime assets

Suggested future file names:
- `favicon/favicon-32.png`
- `favicon/favicon-180.png`
- `logo/settings-logo.png`
- `splash/login-splash.png`

Keep new files unreferenced until they are ready, then update the exact consuming file deliberately.
