# Commandes utiles LunarMood

## Ouvrir le projet

```powershell
cd "C:\Users\Ph3yN\PH3Y NYX\02_APPS\LunarMood_local\origine"
code .
```

## Se deplacer dans le repo

Depuis `origine`, entrer dans la version web :

```powershell
cd .\artifacts\lunar-mood
```

Afficher le dossier courant :

```powershell
pwd
```

Remonter d'un dossier :

```powershell
cd ..
```

## Expo mobile

Depuis la racine du workspace :

```powershell
cd "C:\Users\Ph3yN\PH3Y NYX\02_APPS\LunarMood_local\origine"
pnpm --filter @workspace/lunar-mood-mobile exec expo start
```

Depuis le dossier mobile :

```powershell
cd "C:\Users\Ph3yN\PH3Y NYX\02_APPS\LunarMood_local\origine\artifacts\lunar-mood-mobile"
pnpm exec expo start
```

Lancer avec cache nettoye :

```powershell
pnpm --filter @workspace/lunar-mood-mobile exec expo start --clear
```

Lancer en mode web :

```powershell
pnpm --filter @workspace/lunar-mood-mobile exec expo start --web
```

Lancer pour Android :

```powershell
pnpm --filter @workspace/lunar-mood-mobile exec expo start --android
```

Verifier TypeScript :

```powershell
pnpm --filter @workspace/lunar-mood-mobile typecheck
```

## Note

Le script `pnpm --filter @workspace/lunar-mood-mobile dev` existe, mais il est configure avec des variables Replit. Pour travailler localement sur Windows, utilise plutot les commandes `pnpm exec expo start` ci-dessus.

## TODO Tree

Hors JSX :

```tsx
// TODO: action a faire
// FIXME: bug a corriger
// REVIEW: decision a verifier
// NOTE: info importante
```

Dans JSX :

```tsx
{
  /* TODO: action a faire */
}
{
  /* FIXME: bug a corriger */
}
{
  /* REVIEW: decision a verifier */
}
{
  /* NOTE: info importante */
}
```
