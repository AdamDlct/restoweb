# RestoWeb

RestoWeb est le front-office client du projet **AppResto**, une application de gestion 
de commandes en restaurant développée dans le cadre du BTS SIO (Institut Limayrac).

## Contexte

AppResto remplace le service traditionnel (serveur, commande papier) par un système 
informatisé, découpé en deux applications :

- **RestoWeb** (ce dépôt) : l'interface web utilisée par les clients pour consulter 
  le menu et passer commande. Le client est notifié une fois sa commande prête et 
  vient la récupérer au comptoir.
- **RestoSwing** : le back-office du restaurateur (client lourd Java/Swing) permettant 
  d'afficher, accepter, refuser et préparer les commandes.

## Fonctionnalités

- Consultation du menu
- Inscription / connexion
- Passage et paiement de commande
- Interface responsive (utilisable sur smartphone)
- Communication avec RestoSwing via une API REST

## Technologies

PHP · HTML · CSS · MariaDB · API REST

## Structure du dépôt

```
restoweb/
├── docs/          Diagrammes de conception (MCD, MLD, DA, DCU, sitemap)
├── database/      Scripts SQL (modèle physique de données)
└── app/           Prototype d'interface (React/Vite/TS, généré via Figma Make)
```

Le code source PHP de l'application finale n'est pas encore versionné ; le dossier
[`app/`](./app) contient pour l'instant un prototype d'interface utilisateur.

## Documentation

L'ensemble de la documentation de conception (diagrammes, modèles de données) est
disponible dans le dossier [`docs/`](./docs). Les scripts SQL se trouvent dans
[`database/`](./database).

Compte utilisateur de test par défaut : 
  ```
  login     : jef
  password  : jef 
  email     : jef@restoswing.lim
  ```

## Licence

Projet pédagogique — Institut Limayrac, tous droits réservés.
