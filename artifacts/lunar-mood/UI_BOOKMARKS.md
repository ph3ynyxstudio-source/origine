# UI Bookmarks - Lun4rMood Web

## Router et shell

- [src/App.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/App.tsx:15)

  `App()` monte le shell global, le router Wouter et les routes visibles.

- [src/App.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/App.tsx:23)

  Route `/` et `/dashboard` vers le dashboard principal.

- [src/App.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/App.tsx:25)

  Route `/calendar` vers la vue calendrier.

- [src/App.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/App.tsx:26)

  Route `/statistics` vers les graphiques.

- [src/App.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/App.tsx:27)

  Route `/settings` vers les preferences.

- [src/App.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/App.tsx:31)

  `Toaster` pour les notifications flottantes.

- [src/components/layout/AppLayout.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/layout/AppLayout.tsx:8)

  `AppLayout` est le template de navigation commun a toute l'app.

- [src/components/layout/AppLayout.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/layout/AppLayout.tsx:31)

  Definit les onglets visibles: home, calendar, statistics, settings.

- [src/components/layout/AppLayout.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/layout/AppLayout.tsx:41)

  Sidebar desktop fixe avec logo `Lun4rMood` et liens verticaux.

- [src/components/layout/AppLayout.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/layout/AppLayout.tsx:75)

  Zone centrale de contenu avec largeur max et transition d'entree.

- [src/components/layout/AppLayout.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/layout/AppLayout.tsx:90)

  Bottom nav mobile en glassmorphism, arrondie en haut.

## Ecrans

- [src/pages/Dashboard.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Dashboard.tsx:
13)

  `Moon()` dessine la lune hero: halo neon, disque lumineux, contour brillant.

- [src/pages/Dashboard.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Dashboard.tsx:77)

  `Dashboard` est la home visuelle de l'app.

- [src/pages/Dashboard.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Dashboard.tsx:101)

  Header simple: salutation + date du jour.

- [src/pages/Dashboard.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Dashboard.tsx:107)

  Carte lune hero: phase lunaire centrale, gradient cyan-violet-magenta, jour du cycle.

- [src/pages/Dashboard.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Dashboard.tsx:124)

  Bloc metriques 2 colonnes: humeur et energie.

- [src/pages/Dashboard.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Dashboard.tsx:144)

  Carte insight: texte d'analyse ou fallback narratif si peu de donnees.

- [src/pages/Calendar.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Calendar.tsx:13)

  `Calendar` est la vue planning/mois.

- [src/pages/Calendar.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Calendar.tsx:48)

  Titre centre de page.

- [src/pages/Calendar.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Calendar.tsx:50)

  Bandeau decoratif avec 3 icones de phases lunaires.

- [src/pages/Calendar.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Calendar.tsx:56)

  Barre de navigation du mois avec fleches precedent/suivant.

- [src/pages/Calendar.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Calendar.tsx:68)

  Injection de la grille calendrier.

- [src/pages/Calendar.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Calendar.tsx:70)

  Ouvre la modale `MoodDialog` quand une date est selectionnee.

- [src/pages/Statistics.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Statistics.tsx:24)

  `Statistics` est l'ecran analytics.

- [src/pages/Statistics.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Statistics.tsx:29)

  Etat vide centre si aucune donnee du mois.

- [src/pages/Statistics.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Statistics.tsx:63)

  Header de page avec compteur d'entrees mensuelles.

- [src/pages/Statistics.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Statistics.tsx:69)

  Premiere carte graphique: emotion par phase lunaire.

- [src/pages/Statistics.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Statistics.tsx:94)

  Deuxieme carte graphique: energie par phase lunaire.

- [src/pages/Settings.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Settings.tsx:3)

  `Settings` est un panneau de preferences tres compact.

- [src/pages/Settings.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Settings.tsx:7)

  Fond plein sombre avec centrage vertical/horizontal.

- [src/pages/Settings.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Settings.tsx:15)

  Segmented control EN/FR.

- [src/pages/Settings.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Settings.tsx:38)

  Footer de marque minimal.

- [src/pages/Login.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Login.tsx:11)

  `Login` est l'ecran d'entree / creation de
  compte.

- [src/pages/Login.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Login.tsx:48)

  Wrapper plein ecran centre avec composition hero simple.

- [src/pages/Login.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Login.tsx:49)

  Orbe/lune decorative animee au-dessus du formulaire.

- [src/pages/Login.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Login.tsx:58)

  Carte verre sombre contenant les champs et CTA.

- [src/pages/Login.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/Login.tsx:102)

  Lien de bascule login/register.

- [src/pages/not-found.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/not-found.tsx:1)

  Ecran 404 minimal: icone lune, code 404, lien retour dashboard.

## Templates internes

- [src/components/calendar/CalendarGrid.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/calendar/CalendarGrid.tsx:17)

  `CalendarGrid` construit la grille mensuelle.

- [src/components/calendar/CalendarGrid.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/calendar/CalendarGrid.tsx:21)

  Structure visuelle 7 colonnes.

- [src/components/calendar/CalendarGrid.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/calendar/CalendarGrid.tsx:28)

  Ligne des jours de semaine.

- [src/components/calendar/CalendarGrid.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/calendar/CalendarGrid.tsx:44)

  Monte une `DayCell` par jour.

- [src/components/calendar/DayCell.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/calendar/DayCell.tsx:30)

  `DayCell` est la tuile visuelle d'un jour.

- [src/components/calendar/DayCell.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/calendar/DayCell.tsx:43)

  Conteneur cliquable avec fond translucide et opacite reduite hors mois.

- [src/components/calendar/DayCell.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/calendar/DayCell.tsx:61)

  Icone de phase lunaire dans la cellule.

- [src/components/calendar/DayCell.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/components/calendar/DayCell.tsx:63)

  Trois micro-points de presence pour matin, midi, soir.

- [src/pages/MoodDialog.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/MoodDialog.tsx:21)

  `MoodDialog` est la modale CRUD d'une journee.

- [src/pages/MoodDialog.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/MoodDialog.tsx:78)

  Overlay sombre plein ecran avec carte modale centree.

- [src/pages/MoodDialog.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/MoodDialog.tsx:91)

  Segments matin / midi / soir.

- [src/pages/MoodDialog.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/MoodDialog.tsx:107)

  Slider humeur.

- [src/pages/MoodDialog.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/MoodDialog.tsx:122)

  Slider energie.

- [src/pages/MoodDialog.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/MoodDialog.tsx:137)

  Slider consommation.

- [src/pages/MoodDialog.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/MoodDialog.tsx:152)

  Zone note libre.

- [src/pages/MoodDialog.tsx](/c:/Users/Ph3yN/PH3Y%20NYX/02_APPS/LunarMood_local/origine/artifacts/lunar-mood/src/pages/MoodDialog.tsx:162)

  Barre d'actions: annuler et enregistrer en gradient.

## Hors scope de cet index

- `src/components/ui/*`
  Librairie de primitives UI generiques. Elles servent de briques, pas de templates d'ecran.

- `src/components/lunar/LunarDashboard.tsx`
  Non branche dans les routes actuelles.

