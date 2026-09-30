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
