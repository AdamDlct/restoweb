<?php
/*
  ============================================================================
  INTEGRATION PHP - PAGE PANIER
  ============================================================================
  Objectif futur :
  - Demarrer la session avec session_start().
  - Verifier que l'utilisateur est connecte.
  - Lire le panier depuis $_SESSION ou depuis la base de donnees.
  - Afficher les produits selectionnes avec leurs quantites.
  - Mettre a jour les quantites en POST.
  - Supprimer un produit du panier en POST.
  - Calculer le total HT, la TVA et le total TTC cote serveur.
  - Enregistrer le mode de consommation choisi : sur place ou a emporter.

  A prevoir :
  - Ne jamais faire confiance uniquement aux montants envoyes par le navigateur.
  - Recalculer les prix depuis la base de donnees.
  - Rediriger vers paiement.php uniquement si le panier n'est pas vide.

  Pour le moment, aucune logique PHP n'est ajoutee : ce bloc sert uniquement
  de guide pour la future integration.
*/
?>
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Resto Web</title>
<!-- Une seule feuille de style pour tout le site : voir css/style.css -->
<link rel="stylesheet" href="css/style.css" />
</head>
<body>

<!-- Page Panier extraite de l'ancienne SPA index.html. -->
<div id="page-cart" class="page active">
  <header class="topbar">
    <!-- GUIDE PHP : ce bouton retour pourra devenir un lien href="catalogue.php". -->
    <button type="button" class="back-link" data-nav="catalog">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Retour Ã  la carte
    </button>
    <div class="brand brand-md">
      <span>Resto</span><span> Web</span>
    </div>
  </header>

  <div class="cart-body">
    <div class="cart-title-row">
      <h1>Mon <em>panier</em></h1>
      <!-- GUIDE PHP : afficher ici le nombre total d'articles calcule depuis le panier serveur. -->
      <span class="cart-count" id="cart-count" style="display:none;"></span>
    </div>
    <p class="cart-subtitle">VÃ©rifiez votre commande avant de passer au paiement.</p>

    <!-- Ã‰tat "panier vide" : affichÃ©/masquÃ© par app.js selon le contenu du panier -->
    <div id="cart-empty" class="cart-empty" style="display:none;">
      <p class="emoji">ðŸ›’</p>
      <p class="title">Votre panier est vide</p>
      <p class="sub">Explorez notre carte et choisissez vos plats.</p>
      <button type="button" data-nav="catalog">Voir la carte</button>
    </div>

    <!-- Ã‰tat "panier rempli" -->
    <div id="cart-content">
      <!-- Tableau des articles : l'entÃªte est fixe (HTML), les lignes sont gÃ©nÃ©rÃ©es par app.js dans #cart-rows -->
      <div class="cart-table">
        <div class="cart-table-head">
          <span>Produit</span>
          <span class="center">QuantitÃ©</span>
          <span class="right">PU HT</span>
          <span class="right">Total HT</span>
          <span></span>
        </div>
        <!--
          GUIDE PHP :
          - Remplacer #cart-rows par une boucle sur les lignes du panier.
          - Chaque ligne pourra avoir un formulaire pour modifier la quantite.
          - Le bouton supprimer pourra envoyer l'id produit en POST.
          - Recalculer les prix depuis la base, pas depuis le navigateur.
        -->
        <div id="cart-rows"></div>
      </div>

      <!--
        Choix du mode de consommation (sur place / Ã  emporter).
        Principe : on utilise deux vrais <input type="radio"> (accessibles,
        cochables au clavier) mais on les cache visuellement avec la classe
        ".sr-only" (screen-reader only) ; c'est le <label> stylÃ© autour qui
        sert de bouton visuel. app.js synchronise l'Ã©tat "selected" en CSS
        avec l'Ã©tat rÃ©el de l'input radio.
      -->
      <div class="mode-box">
        <p class="mode-label"><span>Mode de consommation</span><span class="req">*</span></p>
        <div class="mode-options">
          <label class="mode-option" data-mode="surplace">
            <input type="radio" name="mode" value="surplace" class="sr-only" />
            <span class="emoji">ðŸ½ï¸</span>
            <div class="body">
              <p class="label">Sur place</p>
              <p class="desc">Servi Ã  votre table</p>
              <p class="sub">TVA 10 %</p>
            </div>
            <span class="check">âœ“</span>
          </label>
          <label class="mode-option" data-mode="emporter">
            <input type="radio" name="mode" value="emporter" class="sr-only" />
            <span class="emoji">ðŸ¥¡</span>
            <div class="body">
              <p class="label">Ã€ emporter</p>
              <p class="desc">PrÃªt au comptoir</p>
              <p class="sub">TVA 5,5 %</p>
            </div>
            <span class="check">âœ“</span>
          </label>
        </div>
      </div>

      <!-- Totaux : les valeurs (0.00 â‚¬) sont des placeholders, recalculÃ©s par renderCart() dans app.js -->
      <!-- GUIDE PHP : remplacer les placeholders des totaux par les montants calcules cote serveur. -->
      <div class="totals-box">
        <div class="trow"><span class="label">Total HT</span><span class="value" id="cart-total-ht">0.00 â‚¬</span></div>
        <div class="trow"><span class="label muted" id="cart-tva-label">TVA 10 % Â· sur place</span><span class="value muted" id="cart-tva-value">+ 0.00 â‚¬</span></div>
        <div class="trow total-row"><span class="label">Total TTC</span><span class="value" id="cart-total-ttc">0.00 â‚¬</span></div>
      </div>

      <!-- GUIDE PHP : ce bouton pourra envoyer vers paiement.php seulement si le panier serveur n'est pas vide. -->
      <button type="button" class="btn-primary cart-pay-btn" id="cart-pay-btn">ProcÃ©der au paiement â†’</button>
    </div>
  </div>
</div>


<script src="js/data.js"></script>
<script src="js/app.js"></script>
</body>
</html>


