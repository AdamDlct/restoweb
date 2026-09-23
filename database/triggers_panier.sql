-- ============================================================================
-- TRIGGERS DU PANIER
-- ============================================================================
-- A executer APRES MPD_VPROF.sql (les tables doivent exister).
-- Peut etre relance sans probleme (les anciens triggers sont supprimes).
--
-- Principe : PHP ne calcule aucun total, c'est la base qui s'en charge.
--   1. Quand on ajoute / modifie une ligne de commande :
--        total_ligne_ht = qte x prix_ht du produit
--   2. Quand une ligne est ajoutee / modifiee / supprimee :
--        commande.total_commande = somme des total_ligne_ht x (1 + TVA)   -> TTC
--   3. Quand on change le mode de consommation (type_conso) d'une commande :
--        commande.total_commande est recalcule avec le nouveau taux de TVA
--
-- Rappel des valeurs utilisees par panier.php :
--   commande.id_etat    : 0 = panier en cours (pas encore paye)
--   commande.type_conso : 1 = sur place (TVA 10 %  -> x 1.10)
--                         0 = a emporter (TVA 5,5 % -> x 1.055)
-- ============================================================================

USE restoswing;

DROP TRIGGER IF EXISTS trg_ligne_commande_before_insert;
DROP TRIGGER IF EXISTS trg_ligne_commande_before_update;
DROP TRIGGER IF EXISTS trg_ligne_commande_after_insert;
DROP TRIGGER IF EXISTS trg_ligne_commande_after_update;
DROP TRIGGER IF EXISTS trg_ligne_commande_after_delete;
DROP TRIGGER IF EXISTS trg_commande_before_update;

DELIMITER //

-- 1. Calcul du total HT de la ligne AVANT l'enregistrement -----------------

CREATE TRIGGER trg_ligne_commande_before_insert
BEFORE INSERT ON ligne_commande
FOR EACH ROW
BEGIN
  SET NEW.total_ligne_ht = NEW.qte * (SELECT prix_ht FROM produit WHERE id_produit = NEW.id_produit);
END//

CREATE TRIGGER trg_ligne_commande_before_update
BEFORE UPDATE ON ligne_commande
FOR EACH ROW
BEGIN
  SET NEW.total_ligne_ht = NEW.qte * (SELECT prix_ht FROM produit WHERE id_produit = NEW.id_produit);
END//

-- 2. Report du total TTC dans la table commande APRES chaque changement ----
--    total TTC = somme des lignes HT x 1.10 (sur place) ou x 1.055 (a emporter)

CREATE TRIGGER trg_ligne_commande_after_insert
AFTER INSERT ON ligne_commande
FOR EACH ROW
BEGIN
  UPDATE commande
  SET total_commande = ROUND((SELECT IFNULL(SUM(total_ligne_ht), 0) FROM ligne_commande WHERE id_commande = NEW.id_commande)
                             * IF(type_conso = 1, 1.10, 1.055), 2)
  WHERE id_commande = NEW.id_commande;
END//

CREATE TRIGGER trg_ligne_commande_after_update
AFTER UPDATE ON ligne_commande
FOR EACH ROW
BEGIN
  UPDATE commande
  SET total_commande = ROUND((SELECT IFNULL(SUM(total_ligne_ht), 0) FROM ligne_commande WHERE id_commande = NEW.id_commande)
                             * IF(type_conso = 1, 1.10, 1.055), 2)
  WHERE id_commande = NEW.id_commande;
END//

CREATE TRIGGER trg_ligne_commande_after_delete
AFTER DELETE ON ligne_commande
FOR EACH ROW
BEGIN
  UPDATE commande
  SET total_commande = ROUND((SELECT IFNULL(SUM(total_ligne_ht), 0) FROM ligne_commande WHERE id_commande = OLD.id_commande)
                             * IF(type_conso = 1, 1.10, 1.055), 2)
  WHERE id_commande = OLD.id_commande;
END//

-- 3. Changement sur place / a emporter : on recalcule le TTC ---------------

CREATE TRIGGER trg_commande_before_update
BEFORE UPDATE ON commande
FOR EACH ROW
BEGIN
  IF NEW.type_conso <> OLD.type_conso THEN
    SET NEW.total_commande = ROUND((SELECT IFNULL(SUM(total_ligne_ht), 0) FROM ligne_commande WHERE id_commande = NEW.id_commande)
                                   * IF(NEW.type_conso = 1, 1.10, 1.055), 2);
  END IF;
END//

DELIMITER ;

-- Remet a jour les commandes deja presentes dans la base (calculees en HT avant)
UPDATE commande
SET total_commande = ROUND((SELECT IFNULL(SUM(lc.total_ligne_ht), 0) FROM ligne_commande lc WHERE lc.id_commande = commande.id_commande)
                           * IF(type_conso = 1, 1.10, 1.055), 2);
