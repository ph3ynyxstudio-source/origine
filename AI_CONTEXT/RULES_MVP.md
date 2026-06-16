# RULES_MVP.md

# Règles MVP — Lun4rMood


## Hotfix public

Quand un bug est déjà présent sur la version publique :

- corriger uniquement le bug observé
- ne pas refactorer autour
- ne pas changer l’UI sauf si nécessaire au bug
- ne pas ajouter de nouvelle fonctionnalité
- tester le scénario exact qui a causé le bug
- vérifier qu’aucun comportement existant n’a changé

Validation minimale :
- reproduction du bug avant correction
- correction confirmée après modification
- typecheck OK
- build OK

Phrase de contrôle :
Hotfix minimal. Une cause, une correction, un test.
## Priorité actuelle

Stabilité avant nouveauté.

L’objectif est d’avoir une version simple, utilisable, stable et montrable.

## Autorisé

- corriger les bugs
- améliorer la lisibilité
- améliorer mobile
- simplifier les flows
- améliorer les textes
- rendre l’interface plus cohérente
- documenter les décisions importantes

## Interdit sans demande explicite

- ajouter un backend
- ajouter un système social
- ajouter des comptes complexes
- transformer l’app en outil médical
- ajouter des graphiques avancés
- ajouter trop de paramètres
- refactor massif non demandé
- changer l’identité visuelle
- complexifier le calendrier
- modifier plusieurs zones sans raison

## Règle d’exécution

Une tâche = une correction claire.

Avant toute modification :
1. Identifier le fichier concerné.
2. Expliquer brièvement le changement.
3. Modifier uniquement ce qui est demandé.
4. Vérifier que l’app reste stable.

## Phrase de contrôle

Ne transforme pas le projet.
Corrige uniquement ce qui est demandé.
MVP, stabilité, progression réelle.



## Interdit sans demande explicite

- ajouter un réseau social interne
- ajouter des profils publics
- ajouter des likes, commentaires ou abonnements
- ajouter une messagerie entre utilisateurs
- rendre les données visibles publiquement par défaut
## Autorisé plus tard

- export PDF
- export image
- partage natif vers réseaux sociaux
- sauvegarde ou synchronisation contrôlée par l’utilisateur