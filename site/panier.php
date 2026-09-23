<?php
/*
  ============================================================================
  PAGE PANIER
  ============================================================================
  Le panier est une commande "en cours" enregistree en base :
    - une ligne dans la table commande avec id_etat = 0 (panier pas encore paye)
    - une ligne dans ligne_commande par produit choisi

  Les totaux ne sont PAS calcules en PHP : ce sont les triggers
  (database/triggers_panier.sql) qui remplissent :
    - ligne_commande.total_ligne_ht = qte x prix_ht du produit
    - commande.total_commande       = total TTC (somme des lignes HT + TVA)
  Le PHP additionne seulement les lignes pour afficher le total HT,
  et en deduit la TVA (TTC - HT).

  type_conso : 1 = sur place (TVA 10 %), 0 = a emporter (TVA 5,5 %)

  Formulaires traites (en POST, champ "action") :
    - ajouter   : id_produit + qte  -> envoye par la page catalogue
    - plus      : id_ligne          -> +1 sur une ligne
    - moins     : id_ligne          -> -1 (la ligne est supprimee si qte = 1)
    - supprimer : id_ligne          -> supprime la ligne
    - mode      : type_conso        -> sur place / a emporter
    - valider   :                   -> va sur paiement.php

  Exemple de formulaire a mettre dans le catalogue pour ajouter un produit :
    <form method="post" action="panier.php">
      <input type="hidden" name="action" value="ajouter">
      <input type="hidden" name="id_produit" value="4">
      <input type="number" name="qte" value="1" min="1">
      <button type="submit">Ajouter</button>
    </form>
  ============================================================================
*/
session_start();
include("db_functions.php");
$dbh = db_connect();

// ---------------------------------------------------------------------------
// 1. Utilisateur connecte
// ---------------------------------------------------------------------------
// La page de connexion doit enregistrer l'id de l'utilisateur dans $_SESSION['id_user'].
if (isset($_SESSION['id_user'])) {
  $id_user = $_SESSION['id_user'];
} else {
  // TEMPORAIRE : tant que la connexion n'est pas terminee, on utilise le compte
  // de test "jef" (id_user = 1) pour pouvoir tester le panier.
  // Quand la connexion sera faite, remplacer la ligne ci-dessous par :
  //   header('Location: index.php');
  //   exit;
  $id_user = 1;
}

// ---------------------------------------------------------------------------
// 2. Recherche du panier (commande en cours, id_etat = 0) de l'utilisateur
// ---------------------------------------------------------------------------
$sth = $dbh->prepare("SELECT * FROM commande WHERE id_user = :id_user AND id_etat = 0 ORDER BY id_commande DESC LIMIT 1");
$sth->execute(array(':id_user' => $id_user));
$commande = $sth->fetch(PDO::FETCH_ASSOC); // false s'il n'y a pas encore de panier

// ---------------------------------------------------------------------------
// 3. Traitement des formulaires
// ---------------------------------------------------------------------------
$erreur = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $action   = $_POST['action'] ?? '';
  $id_ligne = (int) ($_POST['id_ligne'] ?? 0);

  // 3a. Ajouter un produit (formulaire du catalogue)
  if ($action == 'ajouter') {
    $id_produit = (int) ($_POST['id_produit'] ?? 0);
    $qte        = (int) ($_POST['qte'] ?? 1);

    // On verifie que le produit existe
    $sth = $dbh->prepare("SELECT id_produit FROM produit WHERE id_produit = :id_produit");
    $sth->execute(array(':id_produit' => $id_produit));

    if ($sth->fetch() && $qte > 0) {
      // Pas encore de panier : on cree la commande (sur place par defaut)
      if ($commande) {
        $id_commande = $commande['id_commande'];
      } else {
        $sth = $dbh->prepare("INSERT INTO commande (id_etat, date_commande, total_commande, type_conso, id_user) VALUES (0, NOW(), 0, 1, :id_user)");
        $sth->execute(array(':id_user' => $id_user));
        $id_commande = $dbh->lastInsertId();
      }

      // Produit deja dans le panier ? -> on augmente la quantite, sinon on ajoute une ligne
      $sth = $dbh->prepare("SELECT id_ligne_commande FROM ligne_commande WHERE id_commande = :id_commande AND id_produit = :id_produit");
      $sth->execute(array(':id_commande' => $id_commande, ':id_produit' => $id_produit));
      $ligne = $sth->fetch(PDO::FETCH_ASSOC);

      if ($ligne) {
        $sth = $dbh->prepare("UPDATE ligne_commande SET qte = qte + :qte WHERE id_ligne_commande = :id_ligne");
        $sth->execute(array(':qte' => $qte, ':id_ligne' => $ligne['id_ligne_commande']));
      } else {
        // total_ligne_ht n'est pas donne : c'est le trigger qui le calcule
        $sth = $dbh->prepare("INSERT INTO ligne_commande (qte, id_commande, id_produit) VALUES (:qte, :id_commande, :id_produit)");
        $sth->execute(array(':qte' => $qte, ':id_commande' => $id_commande, ':id_produit' => $id_produit));
      }
    }
  }

  // Pour les actions suivantes, on precise toujours "AND id_commande = ..."
  // pour qu'un utilisateur ne puisse modifier que SON panier.

  // 3b. Bouton "+"
  if ($action == 'plus' && $commande) {
    $sth = $dbh->prepare("UPDATE ligne_commande SET qte = qte + 1 WHERE id_ligne_commande = :id_ligne AND id_commande = :id_commande");
    $sth->execute(array(':id_ligne' => $id_ligne, ':id_commande' => $commande['id_commande']));
  }

  // 3c. Bouton "-" (a 1, on supprime la ligne)
  if ($action == 'moins' && $commande) {
    $sth = $dbh->prepare("SELECT qte FROM ligne_commande WHERE id_ligne_commande = :id_ligne AND id_commande = :id_commande");
    $sth->execute(array(':id_ligne' => $id_ligne, ':id_commande' => $commande['id_commande']));
    $ligne = $sth->fetch(PDO::FETCH_ASSOC);

    if ($ligne && $ligne['qte'] > 1) {
      $sth = $dbh->prepare("UPDATE ligne_commande SET qte = qte - 1 WHERE id_ligne_commande = :id_ligne AND id_commande = :id_commande");
      $sth->execute(array(':id_ligne' => $id_ligne, ':id_commande' => $commande['id_commande']));
    } elseif ($ligne) {
      $sth = $dbh->prepare("DELETE FROM ligne_commande WHERE id_ligne_commande = :id_ligne AND id_commande = :id_commande");
      $sth->execute(array(':id_ligne' => $id_ligne, ':id_commande' => $commande['id_commande']));
    }
  }

  // 3d. Bouton "✕"
  if ($action == 'supprimer' && $commande) {
    $sth = $dbh->prepare("DELETE FROM ligne_commande WHERE id_ligne_commande = :id_ligne AND id_commande = :id_commande");
    $sth->execute(array(':id_ligne' => $id_ligne, ':id_commande' => $commande['id_commande']));
  }

  // 3e. Mode de consommation : 1 = sur place, 0 = a emporter
  if ($action == 'mode' && $commande) {
    $type_conso = ($_POST['type_conso'] ?? '1') == '0' ? 0 : 1;
    $sth = $dbh->prepare("UPDATE commande SET type_conso = :type_conso WHERE id_commande = :id_commande");
    $sth->execute(array(':type_conso' => $type_conso, ':id_commande' => $commande['id_commande']));
  }

  // 3f. Bouton "Proceder au paiement" : seulement si le panier n'est pas vide
  if ($action == 'valider') {
    $nb_lignes = 0;
    if ($commande) {
      $sth = $dbh->prepare("SELECT COUNT(*) FROM ligne_commande WHERE id_commande = :id_commande");
      $sth->execute(array(':id_commande' => $commande['id_commande']));
      $nb_lignes = $sth->fetchColumn();
    }

    if ($nb_lignes > 0) {
      $_SESSION['id_commande'] = $commande['id_commande']; // pour que paiement.php sache quelle commande payer
      header('Location: paiement.php');
      exit;
    }
    $erreur = "Votre panier est vide.";
  }

  // On recharge la page en GET : evite de renvoyer le formulaire si on fait F5
  if ($erreur == "") {
    header('Location: panier.php');
    exit;
  }
}

// ---------------------------------------------------------------------------
// 4. Lecture des lignes du panier (avec le nom et le prix du produit)
// ---------------------------------------------------------------------------
$lignes = array();
if ($commande) {
  $sth = $dbh->prepare("SELECT lc.id_ligne_commande, lc.qte, lc.total_ligne_ht, p.libelle, p.prix_ht
                        FROM ligne_commande lc
                        JOIN produit p ON p.id_produit = lc.id_produit
                        WHERE lc.id_commande = :id_commande
                        ORDER BY lc.id_ligne_commande");
  $sth->execute(array(':id_commande' => $commande['id_commande']));
  $lignes = $sth->fetchAll(PDO::FETCH_ASSOC);
}

// ---------------------------------------------------------------------------
// 5. Totaux
// ---------------------------------------------------------------------------
$nb_articles = 0;
$total_ht    = 0;
foreach ($lignes as $ligne) {
  $nb_articles += $ligne['qte'];
  $total_ht    += $ligne['total_ligne_ht']; // total_ligne_ht calcule par le trigger
}

$total_ttc  = $commande ? $commande['total_commande'] : 0; // TTC calcule par le trigger
$tva        = $total_ttc - $total_ht;
$type_conso = $commande ? $commande['type_conso'] : 1;

// Affiche un montant : 12.5 -> "12.50 €"
function prix($montant) {
  return number_format($montant, 2, '.', ' ') . ' €';
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Resto Web</title>
<!-- Une seule feuille de style pour tout le site : voir css/style.css -->
<link rel="stylesheet" href="css/style.css" />
<style>
  /* Styles propres a cette page (le panier est genere en PHP, sans app.js) */
  a.back-link { text-decoration: none; }
  .cart-empty a {
    display: inline-block;
    padding: 10px 24px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
    text-decoration: none;
    background: var(--primary);
    color: var(--primary-foreground);
  }
  .cart-row { background: var(--card); }
  .cart-row:nth-child(even) { background: var(--background); } /* lignes alternees */
  .cart-row + .cart-row { border-top: 1px solid var(--border); }
  .cart-body .error-msg { margin: 0 0 20px; }

  /* Smartphone : on cache la colonne "PU HT" pour que le tableau tienne dans l'ecran */
  @media (max-width: 480px) {
    .cart-table-head,
    .cart-row {
      grid-template-columns: 1fr 90px 70px 28px;
      gap: 6px;
      padding-left: 12px;
      padding-right: 12px;
    }
    .cart-table-head span:nth-child(3),
    .cart-row .price-cell {
      display: none;
    }
  }
</style>
</head>
<body>

<div id="page-cart" class="page active">
  <header class="topbar">
    <a href="catalogue.php" class="back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Retour à la carte
    </a>
    <div class="brand brand-md">
      <span>Resto</span><span> Web</span>
    </div>
  </header>

  <div class="cart-body">
    <div class="cart-title-row">
      <h1>Mon <em>panier</em></h1>
      <?php if ($nb_articles > 0) { ?>
        <span class="cart-count"><?php echo $nb_articles; ?> article<?php if ($nb_articles > 1) echo 's'; ?></span>
      <?php } ?>
    </div>
    <p class="cart-subtitle">Vérifiez votre commande avant de passer au paiement.</p>

    <?php if ($erreur != "") { ?>
      <p class="error-msg"><?php echo htmlspecialchars($erreur); ?></p>
    <?php } ?>

    <?php if (count($lignes) == 0) { ?>

      <!-- Panier vide -->
      <div class="cart-empty">
        <p class="emoji">🛒</p>
        <p class="title">Votre panier est vide</p>
        <p class="sub">Explorez notre carte et choisissez vos plats.</p>
        <a href="catalogue.php">Voir la carte</a>
      </div>

    <?php } else { ?>

      <!-- Tableau des articles : une ligne = un formulaire (boutons -, +, ✕) -->
      <div class="cart-table">
        <div class="cart-table-head">
          <span>Produit</span>
          <span class="center">Quantité</span>
          <span class="right">PU HT</span>
          <span class="right">Total HT</span>
          <span></span>
        </div>
        <div id="cart-rows">
          <?php foreach ($lignes as $ligne) { ?>
            <form class="cart-row" method="post" action="panier.php">
              <input type="hidden" name="id_ligne" value="<?php echo $ligne['id_ligne_commande']; ?>" />
              <span class="item-name"><?php echo htmlspecialchars($ligne['libelle']); ?></span>
              <div class="qty-cell">
                <div class="qty-stepper">
                  <button type="submit" name="action" value="moins" title="Retirer un">−</button>
                  <span><?php echo $ligne['qte']; ?></span>
                  <button type="submit" name="action" value="plus" title="Ajouter un">+</button>
                </div>
              </div>
              <span class="price-cell"><?php echo prix($ligne['prix_ht']); ?></span>
              <span class="total-cell"><?php echo prix($ligne['total_ligne_ht']); ?></span>
              <div class="remove-cell">
                <button type="submit" name="action" value="supprimer" class="remove-btn" title="Supprimer">✕</button>
              </div>
            </form>
          <?php } ?>
        </div>
      </div>

      <!--
        Mode de consommation : les <input type="radio"> sont caches (classe sr-only),
        c'est le <label> autour qui sert de bouton. Au clic, onchange envoie le formulaire
        et le PHP enregistre le choix dans commande.type_conso.
      -->
      <form class="mode-box" method="post" action="panier.php">
        <input type="hidden" name="action" value="mode" />
        <p class="mode-label"><span>Mode de consommation</span><span class="req">*</span></p>
        <div class="mode-options">
          <label class="mode-option<?php if ($type_conso == 1) echo ' selected'; ?>">
            <input type="radio" name="type_conso" value="1" class="sr-only" onchange="this.form.submit()" <?php if ($type_conso == 1) echo 'checked'; ?> />
            <span class="emoji">🏫</span>
            <div class="body">
              <p class="label">Sur place</p>
              <p class="desc">Servi à votre table</p>
              <p class="sub">TVA 10 %</p>
            </div>
            <span class="check">✔</span>
          </label>
          <label class="mode-option<?php if ($type_conso == 0) echo ' selected'; ?>">
            <input type="radio" name="type_conso" value="0" class="sr-only" onchange="this.form.submit()" <?php if ($type_conso == 0) echo 'checked'; ?> />
            <span class="emoji">🛍️</span>
            <div class="body">
              <p class="label">À emporter</p>
              <p class="desc">Prêt au comptoir</p>
              <p class="sub">TVA 5,5 %</p>
            </div>
            <span class="check">✔</span>
          </label>
        </div>
      </form>

      <!-- Totaux : Total TTC = commande.total_commande (calcule par le trigger) -->
      <div class="totals-box">
        <div class="trow">
          <span class="label">Total HT</span>
          <span class="value"><?php echo prix($total_ht); ?></span>
        </div>
        <div class="trow">
          <span class="label muted">TVA <?php echo ($type_conso == 1) ? '10 % · sur place' : '5,5 % · à emporter'; ?></span>
          <span class="value muted">+ <?php echo prix($tva); ?></span>
        </div>
        <div class="trow total-row">
          <span class="label">Total TTC</span>
          <span class="value"><?php echo prix($total_ttc); ?></span>
        </div>
      </div>

      <form method="post" action="panier.php">
        <input type="hidden" name="action" value="valider" />
        <button type="submit" class="btn-primary cart-pay-btn">Procéder au paiement →</button>
      </form>

    <?php } ?>
  </div>
</div>

</body>
</html>
