-- ============================================================================
-- DONNEES DE TEST DU PANIER
-- ============================================================================
-- Ordre d'execution : MPD_VPROF.sql -> triggers_panier.sql -> produits.sql -> ce fichier
-- ============================================================================

USE restoswing;

-- Un panier en cours (id_etat = 0, sur place) pour le compte de test "jef"
INSERT INTO commande (id_etat, date_commande, total_commande, type_conso, id_user)
VALUES (0, NOW(), 0, 1, (SELECT id_user FROM utilisateur WHERE login = "jef"));

SET @id_commande = LAST_INSERT_ID();

-- Chaque unite commandee = une ligne (qte = 1) : 2 soupes = 2 lignes.
-- Les triggers calculent total_ligne_ht et total_commande (TTC) tout seuls.
INSERT INTO ligne_commande (qte, id_commande, id_produit) VALUES
  (1, @id_commande, 1),
  (1, @id_commande, 1),
  (1, @id_commande, 4),
  (1, @id_commande, 6);
