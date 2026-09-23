<?php
/*
  ============================================================================
  FONCTIONS DU PANIER (utilisees par catalogue.php et panier.php)
  ============================================================================
  - Le panier = une commande avec id_etat = 0 (pas encore payee).
  - Chaque unite commandee = une ligne dans ligne_commande avec qte = 1
    (3 soupes = 3 lignes).
  - total_ligne_ht et total_commande (TTC) sont calcules par les triggers
    (database/triggers_panier.sql).
  ============================================================================
*/

/**
 * Renvoie le panier (commande en cours) de l'utilisateur
 *
 * @return array|false la commande, ou false s'il n'a pas encore de panier
 */
function panier_en_cours($dbh, $id_user) {
  $sth = $dbh->prepare("SELECT * FROM commande WHERE id_user = :id_user AND id_etat = 0 ORDER BY id_commande DESC LIMIT 1");
  $sth->execute(array(':id_user' => $id_user));
  return $sth->fetch(PDO::FETCH_ASSOC);
}

/**
 * Ajoute $qte unites d'un produit au panier : une ligne par unite.
 * Le panier est cree s'il n'existe pas encore (sur place par defaut).
 */
function ajouter_au_panier($dbh, $id_user, $id_produit, $qte) {
  // Quantite entre 1 et 20
  if ($qte < 1) {
    return;
  }
  if ($qte > 20) {
    $qte = 20;
  }

  // Le produit doit exister
  $sth = $dbh->prepare("SELECT id_produit FROM produit WHERE id_produit = :id_produit");
  $sth->execute(array(':id_produit' => $id_produit));
  if (!$sth->fetch()) {
    return;
  }

  // Panier en cours, ou creation d'un nouveau panier
  $commande = panier_en_cours($dbh, $id_user);
  if ($commande) {
    $id_commande = $commande['id_commande'];
  } else {
    $sth = $dbh->prepare("INSERT INTO commande (id_etat, date_commande, total_commande, type_conso, id_user) VALUES (0, NOW(), 0, 1, :id_user)");
    $sth->execute(array(':id_user' => $id_user));
    $id_commande = $dbh->lastInsertId();
  }

  // Une ligne par unite (qte = 1) ; total_ligne_ht est calcule par le trigger
  $sth = $dbh->prepare("INSERT INTO ligne_commande (qte, id_commande, id_produit) VALUES (1, :id_commande, :id_produit)");
  for ($i = 0; $i < $qte; $i++) {
    $sth->execute(array(':id_commande' => $id_commande, ':id_produit' => $id_produit));
  }
}

/**
 * Affiche un montant : 12.5 -> "12.50 €"
 */
function prix($montant) {
  return number_format($montant, 2, '.', ' ') . ' €';
}
