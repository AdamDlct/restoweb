# Notre plan pour l'API du lot 5

L'objectif est de relier RestoWeb à RestoSwing, l'application utilisée en cuisine. RestoSwing pourra demander les commandes payées, puis indiquer si la cuisine les accepte, les refuse ou les a terminées. Voici une répartition possible pour avancer à cinq et comprendre chaque partie de l'échange.

### Définir les règles communes

Confirmer les états : `0` pour le panier, `1` pour une commande payée en attente, `2` en préparation, `3` abandonnée et `4` prête.

Préparer `site/api/_common.php` pour partager la validation des paramètres, la connexion à la base et les réponses silencieuses. Communiquer les règles retenues avant qu'ils terminent leurs endpoints.

### Lire les commandes en attente

Créer `site/api/commandes_en_attente.php`. L'API renverra en JSON les commandes à l'état `1`, avec leurs produits, quantités et totaux. S'il n'y a aucune commande, elle renverra `[]`.

S'appuyer sur le format JSON convenu et le partager pour la documentation.

### Mettre à jour l'état des commandes

Créer `site/api/commande_accepter.php`, `site/api/commande_refuser.php` et `site/api/commande_terminer.php`.

Appliquer uniquement les transitions `1 → 2`, `1 → 3` et `2 → 4`. Ainsi, une action envoyée dans le mauvais ordre ne changera pas l'état de la commande.

### Expliquer comment utiliser l'API

Rédiger `docs/lot5-api.md` avec les URLs, paramètres, états et réponses. Créer également `docs/exemple-commandes-en-attente.json`.

Se coordonner pour les états et avec Marius pour que l'exemple corresponde exactement au JSON renvoyé par l'API.

### Vérifier l'ensemble

Préparer des données de test, puis tester la liste et les trois actions. Vérifier les états enregistrés en base, le cas sans commande, les identifiants invalides et les actions répétées.

Si un résultat est inattendu, noter l'endpoint concerné et le transmettre à la personne responsable du fichier.

Cette répartition est une proposition : l'essentiel est que les états et le format JSON soient décidés avant que les endpoints et la documentation soient terminés.

## Fichiers à créer ou à vérifier

À créer :

- `site/api/_common.php`
- `site/api/commandes_en_attente.php`
- `site/api/commande_accepter.php`
- `site/api/commande_refuser.php`
- `site/api/commande_terminer.php`
- `docs/lot5-api.md`,
- `docs/exemple-commandes-en-attente.json`.

À vérifier : `site/db_functions.php` pour que l'API puisse gérer une erreur de connexion sans l'afficher à RestoSwing; `site/paiement.php` pour confirmer qu'une commande payée passe bien à l'état `1`;
puis `README.md` pour ajouter un lien vers la documentation.

## Adresses utilisées par RestoSwing

- `GET /api/commandes_en_attente.php` : récupérer la liste des commandes en attente.
- `GET /api/commande_accepter.php?id_commande=XX` : accepter une commande.
- `GET /api/commande_refuser.php?id_commande=XX` : refuser une commande.
- `GET /api/commande_terminer.php?id_commande=XX` : indiquer qu'une commande est prête.

## Vérification en équipe

Avant de considérer le lot terminé, testons ensemble une liste vide et une liste avec des commandes, les trois changements d'état, un identifiant invalide et une action répétée. Le but est de vérifier à la fois ce que reçoit RestoSwing et ce qui a réellement été enregistré dans la base de données.


SELECT DISTINCT c.id_commande, c.date_commande, c.id_etat, SUM(l.qte)
FROM commande c, ligne_commande l
WHERE c.id_commande = l.id_commande
AND c.id_etat = 1
GROUP BY c.id_commande;