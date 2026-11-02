CREATE DATABASE IF NOT EXISTS restoswing;
USE restoswing;

CREATE TABLE utilisateur(
   id_user INT AUTO_INCREMENT,
   login VARCHAR(255) ,
   password VARCHAR(255) ,
   email VARCHAR(255) ,
   PRIMARY KEY(id_user)
);

CREATE TABLE commande(
   id_commande INT AUTO_INCREMENT,
   id_etat INT,
   date_commande DATETIME,
   total_commande DECIMAL(10,2)  ,
   type_conso BOOLEAN,
   id_user INT NOT NULL,
   PRIMARY KEY(id_commande),
   FOREIGN KEY(id_user) REFERENCES utilisateur(id_user)
);

CREATE TABLE produit(
   id_produit INT AUTO_INCREMENT,
   libelle VARCHAR(255) ,
   prix_ht DECIMAL(10,2)  ,
   description VARCHAR(255),
   categorie   VARCHAR(50),
   image       VARCHAR(255),
   PRIMARY KEY(id_produit)
);

CREATE TABLE ligne_commande(
   id_ligne_commande INT AUTO_INCREMENT,
   qte INT,
   total_ligne_ht DECIMAL(10,2)  ,
   id_commande INT NOT NULL,
   id_produit INT NOT NULL,
   PRIMARY KEY(id_ligne_commande),
   FOREIGN KEY(id_commande) REFERENCES commande(id_commande),
   FOREIGN KEY(id_produit) REFERENCES produit(id_produit)
);


-- ============================================================================
-- PRODUITS DE LA CARTE (utilises par site/catalogue.php)
-- ============================================================================
-- Ordre d'execution : MPD_VPROF.sql -> triggers_panier.sql -> ce fichier
-- Peut etre relance sans probleme (colonnes ajoutees une seule fois,
-- produits deja presents mis a jour).
--
-- Ajoute 3 colonnes a la table produit pour l'affichage du catalogue :
--   description : texte sous le nom du plat
--   categorie   : Entrées / Plats / Desserts / Boissons (filtres du catalogue)
--   image       : nom du fichier dans site/images/
-- ============================================================================

INSERT INTO utilisateur(login, password, email) 
VALUES ("jef", "jef", "jef@restoswing.lim");

INSERT INTO produit (id_produit, libelle, prix_ht, description, categorie, image) 
VALUES
  (1,  "Soupe à l'oignon",  8.50,  "Gratinée, bouillon de bœuf, comté",                       "Entrées",  "Soupeà l'oignon.jpg"),
  (2,  "Salade niçoise",    10.00, "Thon, œuf mollet, olives, anchois",                       "Entrées",  "Salade nicoise.jpg"),
  (3,  "Tartare de saumon", 12.50, "Avocat, citron vert, aneth",                              "Entrées",  "Tartare de saumon.jpg"),
  (4,  "Bœuf bourguignon",  18.00, "Joue de bœuf, lardons, champignons, pommes de terre",     "Plats",    "Boeuf bourguignon.png"),
  (5,  "Magret de canard",  22.00, "Sauce aux cerises, gratin dauphinois",                    "Plats",    "Magret de canard.jpg"),
  (6,  "Risotto aux cèpes", 16.50, "Parmesan affiné 24 mois, truffe",                         "Plats",    "Risotto aux cèpes.jpg"),
  (7,  "Steak frites",      19.00, "Pièce du boucher, sauce au poivre, frites maison",        "Plats",    "Steak frites.jpg"),
  (8,  "Burger bistro",     14.00, "Bœuf charolais, cheddar, oignons confits, frites maison", "Plats",    "Burger bistro.jpg"),
  (9,  "Crème brûlée",      7.00,  "Vanille Bourbon, caramel croustillant",                   "Desserts", "Crême brulée.jpg"),
  (10, "Fondant chocolat",  7.50,  "Cœur coulant, crème anglaise",                            "Desserts", "Fondant chocolat.jpg"),
  (11, "Tarte tatin",       6.50,  "Pommes caramélisées, crème fraîche",                      "Desserts", "Tarte tatin.jpg"),
  (12, "Café gourmand",     5.50,  "Expresso + 3 mignardises maison",                         "Boissons", "Café gourmand.jpg")
ON DUPLICATE KEY UPDATE
  libelle     = VALUES(libelle),
  prix_ht     = VALUES(prix_ht),
  description = VALUES(description),
  categorie   = VALUES(categorie),
  image       = VALUES(image);

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
