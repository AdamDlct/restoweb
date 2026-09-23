# RestoWeb

RestoWeb est le front-office client du projet **AppResto**, une application de gestion de commandes en restaurant developpee dans le cadre du BTS SIO (Institut Limayrac).

## Contexte

AppResto remplace le service traditionnel (serveur, commande papier) par un systeme informatise, decoupe en deux applications :

- **RestoWeb** (ce depot) : interface web utilisee par les clients pour consulter le menu, gerer leur panier, payer une commande et suivre son etat.
- **RestoSwing** : back-office du restaurateur (client lourd Java/Swing) permettant d'afficher, accepter, refuser et preparer les commandes.

Le client est notifie lorsque sa commande est prete, puis vient la recuperer au comptoir.

## Fonctionnalites

- Consultation du menu et du catalogue
- Ajout de produits au panier
- Passage de commande
- Paiement de commande
- Suivi de commande
- Interface responsive utilisable sur smartphone
- Scripts SQL pour la base de donnees et les tests du panier
- Communication prevue avec RestoSwing via une API REST

## Technologies

PHP - HTML - CSS - JavaScript - MariaDB - API REST

## Structure du depot

```text
restoweb/
|-- docs/          Diagrammes de conception (MCD, MLD, DA, DCU, sitemap)
|-- database/      Scripts SQL (modele physique, triggers et donnees de test)
`-- site/          Code source PHP, CSS, JavaScript et assets de l'application
```

## Pages principales

- [`site/index.php`](./site/index.php) : page d'accueil
- [`site/catalogue.php`](./site/catalogue.php) : consultation du catalogue
- [`site/panier.php`](./site/panier.php) : gestion du panier
- [`site/paiement.php`](./site/paiement.php) : paiement de la commande
- [`site/suivi-commande.php`](./site/suivi-commande.php) : suivi de commande

## Documentation

La documentation de conception est disponible dans le dossier [`docs/`](./docs).

Les scripts SQL sont disponibles dans le dossier [`database/`](./database) :

- [`MPD_VPROF.sql`](./database/MPD_VPROF.sql) : modele physique de donnees
- [`triggers_panier.sql`](./database/triggers_panier.sql) : triggers lies au panier
- [`insert_panier_test.sql`](./database/insert_panier_test.sql) : donnees de test pour le panier

## Organisation du projet

Tableau Trello : [https://trello.com/b/5GMubaY0/ap-2](https://trello.com/b/5GMubaY0/ap-2)

## Compte de test

```text
login    : jef
password : jef
email    : jef@restoswing.lim
```

## Licence

Projet pedagogique - Institut Limayrac, tous droits reserves.
