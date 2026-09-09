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

## Documentation

L'ensemble de la documentation de conception, de réalisation et d'exploitation 
(diagrammes, modèles de données, maquettes, manuels d'installation et d'utilisation) 
est disponible dans le dossier [`/doc`](./doc).

## Licence

Projet pédagogique — Institut Limayrac, tous droits réservés.
