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

INSERT INTO utilisateur(login, password, email) 
VALUES ("jef", "jef", "jef@restoswing.lim");