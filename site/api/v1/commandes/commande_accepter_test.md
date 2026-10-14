Tester l’acceptation : état 1 → état 2
Dans phpMyAdmin, trouver une commande en attente :

EXEMPLE :

SELECT id_commande, id_etat
FROM commande
WHERE id_etat = 1
ORDER BY id_commande DESC;

Appeller ensuite l’URL avec son identifiant:

<http://localhost/www/restoweb/restoweb/site/api/v1/commandes/commande_accepter.php?id_commande=ID>

Remplace ID par id_commande. Résultat attendu : 200 OK et un JSON indiquant l’état 2. Vérifie ensuite dans phpMyAdmin :

SELECT id_commande, id_etat
FROM commande
WHERE id_commande = ID;

Vérifier qu’une commande déjà acceptée est refusée
Rappeller exactement la même URL. Résultat attendu : 409 Conflict, sans corps de réponse. La commande doit rester à l’état 2.

Si plus de commande à tester
Repèrer un utilisateur de test :

SELECT id_user, login
FROM utilisateur
WHERE login = 'jef';

Crée une commande temporaire en attente, en remplaçant ID_USER par l’identifiant obtenu :

INSERT INTO commande (id_etat, date_commande, total_commande, type_conso, id_user)
VALUES (1, NOW(), 0, 1, ID_USER);

PhpMyAdmin indique l’identifiant de la commande insérée. Utiliser dans l’URL ci-dessus. Après les tests, supprimer uniquement cette commande temporaire :

DELETE FROM commande
WHERE id_commande = ID;

Pour vérifier les états 3 ou 4, créer une commande temporaire en remplaçant le premier 1 de l’INSERT par 3 ou 4. L’appel à l’API doit alors répondre 409, et la commande doit garder son état initial.
