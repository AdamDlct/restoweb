<?php
/*
  ============================================================================
  PAGE PAIEMENT (paiement fictif)
  ============================================================================
  - Affiche le recapitulatif du panier lu en base (commande avec id_etat = 0).
  - Le total TTC vient de commande.total_commande (calcule par les triggers).
  - Quand on clique sur "Payer" :
      1. le PHP verifie le format de la carte (rien n'est enregistre)
      2. la commande passe a id_etat = 1 (payee, en attente du restaurateur)
         avec la date du paiement
      3. redirection vers suivi-commande.php
    Au prochain ajout dans le catalogue, un nouveau panier sera cree.

  id_etat : 0 = panier en cours, 1 = payee / en attente
  ============================================================================
*/
session_start();
include("db_functions.php");
include("panier_functions.php");
$dbh = db_connect();

// ---------------------------------------------------------------------------
// 1. Il faut etre connecte et avoir un panier non vide
// ---------------------------------------------------------------------------
if (!isset($_SESSION['id_user'])) {
  header('Location: index.php');
  exit;
}
$id_user  = $_SESSION['id_user'];
$commande = panier_en_cours($dbh, $id_user);

$lignes = array();
if ($commande) {
  // Une ligne par produit pour le recapitulatif : "Soupe à l'oignon × 3"
  $sth = $dbh->prepare("SELECT p.libelle, SUM(lc.qte) AS nb, SUM(lc.total_ligne_ht) AS total_ht
                        FROM ligne_commande lc
                        JOIN produit p ON p.id_produit = lc.id_produit
                        WHERE lc.id_commande = :id_commande
                        GROUP BY lc.id_produit, p.libelle
                        ORDER BY lc.id_produit");
  $sth->execute(array(':id_commande' => $commande['id_commande']));
  $lignes = $sth->fetchAll(PDO::FETCH_ASSOC);
}

if (count($lignes) == 0) {
  header('Location: panier.php'); // rien a payer
  exit;
}

// ---------------------------------------------------------------------------
// 2. Bouton "Payer" : verification du formulaire puis validation de la commande
// ---------------------------------------------------------------------------
$erreur = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $carte      = preg_replace('/\D/', '', $_POST['carte'] ?? ''); // on garde seulement les chiffres
  $expiration = $_POST['expiration'] ?? '';
  $cvc        = $_POST['cvc'] ?? '';

  if (strlen($carte) != 16) {
    $erreur = "Numéro de carte invalide (16 chiffres).";
  } elseif (!preg_match('/^(0[1-9]|1[0-2])\/[0-9]{2}$/', $expiration)) {
    $erreur = "Date d'expiration invalide (MM/AA).";
  } elseif (!preg_match('/^[0-9]{3,4}$/', $cvc)) {
    $erreur = "CVC invalide.";
  } else {
    // Paiement fictif accepte : la commande est payee (id_etat = 1)
    $sth = $dbh->prepare("UPDATE commande SET id_etat = 1, date_commande = NOW()
                          WHERE id_commande = :id_commande AND id_user = :id_user AND id_etat = 0");
    $sth->execute(array(':id_commande' => $commande['id_commande'], ':id_user' => $id_user));

    $_SESSION['id_commande'] = $commande['id_commande']; // commande a afficher sur la page de suivi
    header('Location: suivi-commande.php');
    exit;
  }
}

// ---------------------------------------------------------------------------
// 3. Totaux
// ---------------------------------------------------------------------------
$total_ht = 0;
foreach ($lignes as $ligne) {
  $total_ht += $ligne['total_ht'];
}
$total_ttc = $commande['total_commande'];   // calcule par le trigger
$tva       = $total_ttc - $total_ht;
$sur_place = ($commande['type_conso'] == 1);
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
  /* Styles propres a cette page (paiement genere en PHP, sans app.js) */
  a.back-link { text-decoration: none; }
</style>
</head>
<body>

<div id="page-payment" class="page active">
  <header class="topbar">
    <a href="panier.php" class="back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Retour au panier
    </a>
    <div class="brand brand-md">
      <span>Resto</span><span> Web</span>
    </div>
  </header>

  <div class="payment-body">
    <!-- Colonne gauche : formulaire -->
    <div>
      <h1><em>Paiement</em></h1>
      <p class="payment-subtitle">Finalisez votre commande en renseignant vos coordonnées.</p>

      <div class="fictitious-notice">
        <span class="icon">💳</span>
        <span><strong>Paiement fictif</strong> — aucune transaction réelle. Ne saisissez pas vos vraies coordonnées bancaires.</span>
      </div>

      <!-- Carte bancaire visuelle : mise a jour pendant la saisie par le petit script en bas de page -->
      <div class="card-widget">
        <div class="circle-a"></div>
        <div class="circle-b"></div>
        <div class="content">
          <div class="row-top">
            <p>Resto Carte</p>
            <svg width="40" height="26" viewBox="0 0 40 26" fill="none">
              <circle cx="15" cy="13" r="13" fill="rgba(255,255,255,0.4)" />
              <circle cx="25" cy="13" r="13" fill="rgba(255,255,255,0.25)" />
            </svg>
          </div>
          <p class="card-number" id="card-number-display">•••• •••• •••• ••••</p>
          <div class="card-meta">
            <div>
              <p class="sub-label">Expiration</p>
              <p id="card-expiry-display">MM/AA</p>
            </div>
            <div class="right">
              <p class="sub-label">CVC</p>
              <p id="card-cvc-display">•••</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Les donnees de carte sont seulement verifiees en PHP, jamais enregistrees -->
      <form method="post" action="paiement.php" class="pay-form">
        <div class="field pay-field">
          <label for="pay-card">Numéro de carte</label>
          <input type="text" id="pay-card" name="carte" placeholder="1234 5678 9012 3456" maxlength="19" inputmode="numeric" autocomplete="off" />
        </div>
        <div class="pay-row">
          <div class="field pay-field">
            <label for="pay-expiry">Date d'expiration</label>
            <input type="text" id="pay-expiry" name="expiration" placeholder="MM/AA" maxlength="5" inputmode="numeric" autocomplete="off" />
          </div>
          <div class="field pay-field">
            <label for="pay-cvc">CVC</label>
            <input type="text" id="pay-cvc" name="cvc" placeholder="123" maxlength="4" inputmode="numeric" autocomplete="off" />
          </div>
        </div>

        <?php if ($erreur != "") { ?>
          <p class="error-msg"><?php echo htmlspecialchars($erreur); ?></p>
        <?php } ?>

        <button type="submit" class="btn-primary pay-submit">Payer <?php echo prix($total_ttc); ?> TTC</button>
      </form>
    </div>

    <!-- Colonne droite : recapitulatif de la commande (lu en base) -->
    <div class="summary-panel">
      <div class="summary-card">
        <div class="summary-head"><h2>Récapitulatif</h2></div>
        <div class="summary-content">
          <div class="summary-items">
            <?php foreach ($lignes as $ligne) { ?>
              <div class="summary-item">
                <span class="name"><?php echo htmlspecialchars($ligne['libelle']); ?><span class="qty"> × <?php echo $ligne['nb']; ?></span></span>
                <span class="price"><?php echo prix($ligne['total_ht']); ?></span>
              </div>
            <?php } ?>
          </div>
          <div class="summary-totals">
            <div class="trow"><span class="label">Total HT</span><span class="value"><?php echo prix($total_ht); ?></span></div>
            <div class="trow"><span class="label muted">TVA <?php echo $sur_place ? '10 %' : '5,5 %'; ?></span><span class="value muted"><?php echo prix($tva); ?></span></div>
            <div class="trow total-row"><span class="label">Total TTC</span><span class="value"><?php echo prix($total_ttc); ?></span></div>
          </div>
          <div class="summary-mode"><?php echo $sur_place ? '🏫 Sur place' : '🛍️ À emporter'; ?></div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  // Affichage uniquement : met en forme la saisie et recopie les valeurs sur la carte visuelle.
  // La verification et la validation du paiement sont faites en PHP.
  var carte = document.getElementById("pay-card");
  var expiration = document.getElementById("pay-expiry");
  var cvc = document.getElementById("pay-cvc");

  carte.addEventListener("input", function () {
    carte.value = carte.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); // 1234 5678 ...
    document.getElementById("card-number-display").textContent = carte.value || "•••• •••• •••• ••••";
  });
  expiration.addEventListener("input", function () {
    var chiffres = expiration.value.replace(/\D/g, "").slice(0, 4);
    expiration.value = chiffres.length > 2 ? chiffres.slice(0, 2) + "/" + chiffres.slice(2) : chiffres; // MM/AA
    document.getElementById("card-expiry-display").textContent = expiration.value || "MM/AA";
  });
  cvc.addEventListener("input", function () {
    cvc.value = cvc.value.replace(/\D/g, "").slice(0, 4);
    document.getElementById("card-cvc-display").textContent = cvc.value ? "•".repeat(cvc.value.length) : "•••";
  });
</script>
</body>
</html>
