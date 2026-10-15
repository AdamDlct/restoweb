# API des commandes

Cette API permet au back-office RestoSwing de consulter et de mettre à jour les
commandes stockées dans la base `restoswing`.

## Adresse de base

Sous l'installation locale XAMPP utilisée par le projet, les endpoints se
trouvent sous :

```text
http://localhost/www/restoweb/restoweb/site/api/v1/commandes/
```

Adaptez cette adresse au nom d'hôte et au chemin configurés sur votre serveur.
Les exemples ci-dessous utilisent `http://localhost` et supposent que le projet
est installé sous `/www/restoweb/restoweb`.

## Conventions

- Les identifiants de commande sont transmis dans l'URL avec le paramètre
  `id_commande`.
- Les endpoints de consultation et de changement d'état s'utilisent avec la
  méthode `GET`.
- Les réponses nominales des endpoints de commande sont au format JSON.
- Les états manipulés par les endpoints sont : `1` (en attente), `2` (en
  préparation), `4` (terminée) et `5` (refusée). L'état `0` correspond au panier
  en cours dans le site. Les autres états ne sont pas décrits ici faute de
  définition commune dans les endpoints.
- Ces endpoints ne vérifient pas l'identité ou les droits du client appelant.
  Ne les exposez pas à un réseau non fiable sans ajouter d'authentification et
  d'autorisation.

## Endpoints

### Lister les commandes en attente

```http
GET /commandes_en_attente.php
```

Renvoie les commandes à l'état `1` qui ont au moins une ligne de commande.
Chaque élément contient `id_commande`, `date_commande`, `id_etat` et `Total`
(somme des quantités des lignes).

Exemple :

```bash
curl "http://localhost/www/restoweb/restoweb/site/api/v1/commandes/commandes_en_attente.php"
```

Réponse nominale :

```json
[
  {
    "id_commande": 12,
    "date_commande": "2026-10-15 09:00:00",
    "id_etat": 1,
    "Total": 3
  }
]
```

Une liste vide est renvoyée sous la forme `[]` lorsqu'aucune commande
correspondante n'est trouvée.

### Consulter les lignes d'une commande

```http
GET /commande_detaillee.php?id_commande={id}
```

Renvoie les lignes de la commande sous forme de tableau JSON. Chaque ligne
contient `id_ligne_commande`, `libelle` et `qte`.

Exemple :

```bash
curl "http://localhost/www/restoweb/restoweb/site/api/v1/commandes/commande_detaillee.php?id_commande=12"
```

Réponse nominale :

```json
[
  {
    "id_ligne_commande": 34,
    "libelle": "Soupe à l'oignon",
    "qte": 2
  }
]
```

### Accepter une commande

```http
GET /commande_accepter.php?id_commande={id}
```

Seule une commande à l'état `1` peut passer à l'état `2`.

Exemple :

```bash
curl -i "http://localhost/www/restoweb/restoweb/site/api/v1/commandes/commande_accepter.php?id_commande=12"
```

En cas de succès, l'API renvoie `200 OK` et :

```json
{
  "succes": true,
  "id_commande": 12,
  "id_etat": 2
}
```

### Terminer une commande

```http
GET /commande_terminer.php?id_commande={id}
```

Seule une commande à l'état `2` peut passer à l'état `4`.

Exemple :

```bash
curl -i "http://localhost/www/restoweb/restoweb/site/api/v1/commandes/commande_terminer.php?id_commande=12"
```

En cas de succès, l'API renvoie `200 OK` et :

```json
{
  "succes": true,
  "id_commande": 12,
  "id_etat": 4
}
```

### Refuser une commande

```http
GET /commande_refuser.php?id_commande={id}
```

Pour un identifiant fourni, l'endpoint demande le passage à l'état `5` et
renvoie un objet JSON indiquant `succes`, `id_commande` et `id_etat`. À la
différence des endpoints d'acceptation et de fin, il ne contrôle pas l'état
actuel de la commande et ne distingue pas une commande inconnue.

Exemple :

```bash
curl -i "http://localhost/www/restoweb/restoweb/site/api/v1/commandes/commande_refuser.php?id_commande=12"
```

## Codes HTTP et limites connues

Les endpoints d'acceptation et de fin appliquent les codes suivants :

| Code HTTP | Signification |
| --- | --- |
| `200` | Changement d'état effectué ; réponse JSON de succès. |
| `400` | Identifiant absent, invalide ou non positif. |
| `404` | Identifiant valide, mais commande inexistante. |
| `405` | Méthode autre que `GET`. L'en-tête `Allow: GET` est renvoyé. |
| `409` | La commande existe, mais son état ne permet pas cette transition. |
| `500` | Erreur de base de données. Les détails ne sont pas envoyés au client. |

Les réponses d'erreur de ces deux endpoints sont vides. Les autres endpoints
ont une gestion des erreurs moins uniforme : notamment, la validation des
paramètres et les codes HTTP d'erreur ne suivent pas tous ce contrat.

L'interface de suivi du site utilise actuellement une simulation JavaScript
des étapes de commande ; elle n'interroge pas encore cette API pour afficher
les changements d'état en temps réel.
