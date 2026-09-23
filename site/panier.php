<?php
/*
  ============================================================================
  PAGE PANIER
  ============================================================================
  Le panier est une commande "en cours" enregistree en base :
    - une ligne dans la table commande avec id_etat = 0 (panier pas encore paye)
    - une ligne dans ligne_commande PAR UNITE commandee (qte = 1) :
      3 soupes = 3 lignes. Les produits sont ajoutes depuis catalogue.php.

  Les totaux ne sont PAS calcules en PHP : ce sont les triggers
  (database/triggers_panier.sql) qui remplissent :
    - ligne_commande.total_ligne_ht = qte x prix_ht du produit
    - commande.total_commande       = total TTC (somme des lignes HT + TVA)
  Le PHP additionne seulement les lignes pour afficher le total HT,
  et en deduit la TVA (TTC - HT).

  type_conso : 1 = sur place (TVA 10 %), 0 = a emporter (TVA 5,5 %)

  Formulaires traites (en POST, champ "action") :
    - plus      : id_ligne    -> ajoute une unite du meme produit (nouvelle ligne)
    - moins     : id_ligne    -> retire cette unite (supprime la ligne)
    - supprimer : id_ligne    -> supprime la ligne
    - mode      : type_conso  -> sur place / a emporter
    - valider   :             -> va sur paiement.php
  ============================================================================
*/
session_start();
include("db_functions.php");
include("panier_functions.php");
$dbh = db_connect();

// ---------------------------------------------------------------------------
// 1. Il faut etre connecte (id_user enregistre par index.php)
// ---------------------------------------------------------------------------
if (!isset($_SESSION['id_user'])) {
  header('Location: index.php');
  exit;
}
$id_user = $_SESSION['id_user'];

// ---------------------------------------------------------------------------
// 2. Panier (commande en cours) de l'utilisateur, false s'il n'en a pas
// ---------------------------------------------------------------------------
$commande = panier_en_cours($dbh, $id_user);

// ---------------------------------------------------------------------------
// 3. Traitement des formulaires
// ---------------------------------------------------------------------------
$erreur = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $action   = $_POST['action'] ?? '';
  $id_ligne = (int) ($_POST['id_ligne'] ?? 0);

  // On precise toujours "AND id_commande = ..." pour qu'un utilisateur
  // ne puisse modifier que SON panier.

  // 3a. Bouton "+" : une unite de plus du meme produit = une nouvelle ligne
  if ($action == 'plus' && $commande) {
    $sth = $dbh->prepare("SELECT id_produit FROM ligne_commande WHERE id_ligne_commande = :id_ligne AND id_commande = :id_commande");
    $sth->execute(array(':id_ligne' => $id_ligne, ':id_commande' => $commande['id_commande']));
    $ligne = $sth->fetch(PDO::FETCH_ASSOC);

    if ($ligne) {
      ajouter_au_panier($dbh, $id_user, $ligne['id_produit'], 1);
    }
  }

  // 3b. Bouton "-" ou "✕" : on retire cette unite = on supprime la ligne
  if (($action == 'moins' || $action == 'supprimer') && $commande) {
    $sth = $dbh->prepare("DELETE FROM ligne_commande WHERE id_ligne_commande = :id_ligne AND id_commande = :id_commande");
    $sth->execute(array(':id_ligne' => $id_ligne, ':id_commande' => $commande['id_commande']));
  }

  // 3c. Mode de consommation : 1 = sur place, 0 = a emporter
  if ($action == 'mode' && $commande) {
    $type_conso = ($_POST['type_conso'] ?? '1') == '0' ? 0 : 1;
    $sth = $dbh->prepare("UPDATE commande SET type_conso = :type_conso WHERE id_commande = :id_commande");
    $sth->execute(array(':type_conso' => $type_conso, ':id_commande' => $commande['id_commande']));
  }

  // 3d. Bouton "Proceder au paiement" : seulement si le panier n'est pas vide
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
                        ORDER BY lc.id_produit, lc.id_ligne_commande"); // les unites d'un meme produit restent groupees
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
