# RestoWeb

**RestoWeb** est le front-office web client d’**AppResto**, une application de commande de restaurant réalisée en PHP, JavaScript et MariaDB dans le cadre du BTS SIO à l’Institut Limayrac.

## Présentation du projet

Le client consulte la carte, ajoute des produits à son panier, choisit la consommation sur place ou à emporter, puis valide une commande au moyen d’un paiement simulé. Il peut ensuite consulter un écran de suivi. Le restaurateur traite les commandes depuis l’application compagnon **RestoSwing** (Java/Swing), qui utilise l’API HTTP de ce dépôt pour lister les commandes en attente, en consulter le détail et les accepter, refuser ou terminer.

Le panier et ses lignes sont stockés dans MariaDB. Les triggers SQL calculent les montants HT et TTC. Le suivi affiché côté client repose actuellement sur une simulation JavaScript et n’est pas synchronisé en temps réel avec les changements d’état opérés par RestoSwing.

## Fonctionnalités

- Création de compte et connexion avec login ou adresse e-mail.
- Consultation et filtrage du catalogue par catégorie.
- Ajout et suppression de produits dans le panier, modification du mode de consommation et affichage des totaux HT, TVA et TTC.
- Validation de commande avec vérification de format des champs de carte ; aucun paiement réel n’est effectué et les données de carte ne sont pas enregistrées.
- Écran de suivi de commande.
- API de commandes pour l’application RestoSwing : liste des commandes en attente, détail, acceptation, refus et fin de préparation.
- Interface adaptée aux écrans mobiles.

## Comptes prédéfinis

Le script `database/MPD_VPROF.sql` crée le compte de démonstration suivant :

| Login | Mot de passe | E-mail |
| --- | --- | --- |
| `jef` | `jef` | `jef@restoswing.lim` |

Ce compte est inséré avec un mot de passe en clair pour la démonstration historique. Les nouveaux comptes sont enregistrés avec un mot de passe haché. N’utilisez pas ces identifiants sur un service public.

## Installation locale

1. Créer la base et les tables en exécutant `database/MPD_VPROF.sql` sur MariaDB/MySQL.
2. Exécuter `database/triggers_panier.sql`, puis `database/produits.sql`.
3. Facultativement, exécuter `database/insert_panier_test.sql` pour créer un panier de démonstration pour `jef`.
4. Configurer le serveur web pour servir le dossier `site/` (PHP avec PDO MySQL) et adapter au besoin les paramètres de connexion dans `site/db_functions.php`.
5. Ouvrir le site à l’adresse configurée. Le fichier `index.php` à la racine redirige vers `site/`.

La configuration de développement actuelle utilise `localhost`, la base `restoswing` et l’utilisateur MySQL `root` sans mot de passe. À adapter à l’environnement d’installation.

## Pages du site

| Page | Rôle |
| --- | --- |
| `site/index.php` | Inscription et connexion |
| `site/catalogue.php` | Carte et sélection de produits |
| `site/panier.php` | Gestion du panier et choix sur place / à emporter |
| `site/paiement.php` | Récapitulatif et validation simulée |
| `site/suivi-commande.php` | Affichage du suivi |
| `site/deconnexion.php` | Fin de session |

## API HTTP

Les endpoints sont sous `site/api/v1/commandes/`. L’adresse locale complète dépend du chemin de déploiement. Le document [`site/api/API.MD`](site/api/API.MD) décrit les paramètres, réponses et limites.

| Méthode et route | Rôle |
| --- | --- |
| `GET /commandes_en_attente.php` | Liste les commandes à l’état `1` comportant au moins une ligne. |
| `GET /commande_detaillee.php?id_commande={id}` | Renvoie les lignes, libellés et quantités d’une commande. |
| `GET /commande_accepter.php?id_commande={id}` | Passe une commande de l’état `1` à l’état `2`. |
| `GET /commande_refuser.php?id_commande={id}` | Passe une commande à l’état `5`. L’endpoint ne contrôle pas l’état courant. |
| `GET /commande_terminer.php?id_commande={id}` | Passe une commande de l’état `2` à l’état `4`. |

Les changements d’état utilisent actuellement `GET`. L’API ne comporte pas de mécanisme d’authentification ou d’autorisation.

## Base de données

La base créée par les scripts s’appelle `restoswing`.

| Table | Rôle |
| --- | --- |
| `utilisateur` | Comptes clients : identifiant, login, mot de passe et e-mail. |
| `produit` | Carte : libellé, prix HT, description, catégorie et nom d’image. |
| `commande` | Panier ou commande d’un client : date, état, total TTC, mode de consommation et utilisateur propriétaire. |
| `ligne_commande` | Produits et quantités liés à une commande ; contient le total HT de la ligne. |

### États, mode de consommation et TVA

| Valeur | Signification dans l’application |
| --- | --- |
| `commande.id_etat = 0` | Panier en cours, non payé. |
| `commande.id_etat = 1` | Commande payée, en attente du restaurateur. |
| `commande.id_etat = 2` | Commande acceptée / en préparation. |
| `commande.id_etat = 4` | Commande terminée / prête. |
| `commande.id_etat = 5` | Commande refusée. |
| `commande.type_conso = 1` | Sur place : TVA 10 % (multiplicateur TTC 1,10). |
| `commande.type_conso = 0` | À emporter : TVA 5,5 % (multiplicateur TTC 1,055). |

Les scripts et endpoints n’énumèrent pas de sens pour les autres valeurs d’état. Les prix des produits sont enregistrés en HT ; le total de commande est enregistré en TTC.

## Triggers SQL, fonctions et procédures

`database/triggers_panier.sql` (également intégré dans `database/MPD_VPROF.sql`) définit les triggers suivants :

| Trigger | Rôle |
| --- | --- |
| `trg_ligne_commande_before_insert` | Calcule `total_ligne_ht` à partir de la quantité et du prix HT du produit avant insertion. |
| `trg_ligne_commande_before_update` | Recalcule le total HT de la ligne avant modification. |
| `trg_ligne_commande_after_insert` | Recalcule le total TTC de la commande après ajout d’une ligne. |
| `trg_ligne_commande_after_update` | Recalcule le total TTC après modification d’une ligne. |
| `trg_ligne_commande_after_delete` | Recalcule le total TTC après suppression d’une ligne. |
| `trg_commande_before_update` | Recalcule le total TTC si le mode de consommation change. |

Les scripts ne déclarent pas de fonction ni de procédure stockée.

## Arborescence

```text
.
├── index.php                         # Redirection vers site/
├── README.md
├── database/
│   ├── MPD_VPROF.sql                 # Création du schéma, compte de démo et triggers
│   ├── produits.sql                  # Colonnes et données du catalogue
│   ├── triggers_panier.sql           # Calcul des totaux
│   └── insert_panier_test.sql        # Données facultatives de démonstration
├── docs/
│   ├── DA.drawio.png                 # Diagramme d’architecture
│   ├── DCU_RestoWeb_RestoSwing.drawio.png # Cas d’utilisation
│   ├── MCD_RestoWeb.png              # Modèle conceptuel de données
│   ├── MLD_RestoWeb.png              # Modèle logique de données
│   ├── sitemap_restoweb.jpg          # Plan du site
│   └── Documentation_technique_API_RestoWeb.docx
└── site/
    ├── index.php                     # Authentification / inscription
    ├── catalogue.php
    ├── panier.php
    ├── panier_functions.php
    ├── paiement.php
    ├── suivi-commande.php
    ├── deconnexion.php
    ├── db_functions.php
    ├── api/
    │   ├── API.MD
    │   └── v1/commandes/              # Endpoints listés ci-dessus
    ├── assets/logo.svg
    ├── css/style.css
    ├── images/                        # Visuels du site et des produits
    └── js/
        ├── app.js
        └── data.js
```

## Documents

- [Cas d’utilisation (DCU)](docs/DCU_RestoWeb_RestoSwing.drawio.png)
- [Diagramme d’architecture (DA)](docs/DA.drawio.png)
- [MCD](docs/MCD_RestoWeb.png) et [MLD](docs/MLD_RestoWeb.png)
- [Plan du site](docs/sitemap_restoweb.jpg)
- [Documentation technique de l’API (DOCX)](docs/Documentation_technique_API_RestoWeb.docx)
- [Documentation des endpoints de l’API](site/api/API.MD)

Le dépôt ne contient pas de document explicitement identifié comme documentation d’exploitation.

## Git et contributeurs

La branche présente dans le dépôt est `main` (avec `origin/main` comme branche distante suivie).

Contributeurs indiqués par l’historique Git :

- Adam DELACOTTE
- ELALAMI-EREFFAS Alya
- Liam DE SOUSA--TOUDRET
- Maé Melouki
- Marius Chiapella

## Technologies

PHP, HTML, CSS, JavaScript, MariaDB/MySQL et API HTTP JSON. Projet pédagogique de l’Institut Limayrac.
