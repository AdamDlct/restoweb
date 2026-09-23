-- ============================================================================
-- DONNEES DE TEST DU PANIER
-- ============================================================================
-- Ordre d'execution : MPD_VPROF.sql -> triggers_panier.sql -> ce fichier
-- ============================================================================

USE restoswing;

-- Produits de la carte (memes id que dans site/js/data.js)
INSERT INTO produit (id_produit, libelle, prix_ht) VALUES
  (1, "Soupe à l'oignon",  8.50),
  (2, "Salade niçoise",    10.00),
  (3, "Tartare de saumon", 12.50),
  (4, "Bœuf bourguignon",  18.00),
  (5, "Magret de canard",  22.00),
  (6, "Risotto aux cèpes", 16.50);

-- Un panier en cours (id_etat = 0, sur place) pour le compte de test "jef"
INSERT INTO commande (id_etat, date_commande, total_commande, type_conso, id_user)
VALUES (0, NOW(), 0, 1, (SELECT id_user FROM utilisateur WHERE login = "jef"));

SET @id_commande = LAST_INSERT_ID();

-- Plusieurs produits dans ce panier : on ne donne que la quantite,
-- les triggers calculent total_ligne_ht et total_commande tout seuls.
INSERT INTO ligne_commande (qte, id_commande, id_produit) VALUES
  (2, @id_commande, 1),
  (1, @id_commande, 4),
  (1, @id_commande, 6);
