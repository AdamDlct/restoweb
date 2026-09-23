<?php
/*
  ============================================================================
  INTEGRATION PHP - PAGE PAIEMENT
  ============================================================================
  Objectif futur :
  - Demarrer la session avec session_start().
  - Verifier que l'utilisateur est connecte.
  - Verifier qu'un panier existe avant d'arriver sur cette page.
  - Recuperer le recapitulatif de commande depuis la session ou la base.
  - Recalculer le total cote serveur.
  - Simuler ou enregistrer le paiement selon les consignes du projet.
  - Creer la commande en base de donnees apres validation.
  - Vider le panier apres creation de la commande.
  - Rediriger vers suivi-commande.php avec l'identifiant de commande.

  A prevoir :
  - Ne pas stocker de vraies donnees bancaires.
  - Valider les champs cote serveur meme si le JavaScript valide deja cote client.
  - Enregistrer un statut initial de commande, par exemple "en_attente".

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

<!-- Page Paiement extraite de l'ancienne SPA index.html. -->
<div id="page-payment" class="page active">
  <header class="topbar">
    <!-- GUIDE PHP : ce bouton retour pourra devenir un lien href="panier.php". -->
    <button type="button" class="back-link" data-nav="cart">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      Retour au panier
    </button>
    <div class="brand brand-md">
      <span>Resto</span><span> Web</span>
    </div>
  </header>

  <div class="payment-body">
    <!-- Colonne gauche : formulaire -->
    <div>
      <h1><em>Paiement</em></h1>
      <p class="payment-subtitle">Finalisez votre commande en renseignant vos coordonnÃ©es.</p>

      <div class="fictitious-notice">
        <span class="icon">ðŸ”’</span>
        <span><strong>Paiement fictif</strong> â€” aucune transaction rÃ©elle. Ne saisissez pas vos vraies coordonnÃ©es bancaires.</span>
      </div>

      <!-- Carte bancaire visuelle : son contenu (numÃ©ro, expiration, CVC) est mis Ã  jour en direct par app.js pendant la saisie -->
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
          <p class="card-number" id="card-number-display">â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢</p>
          <div class="card-meta">
            <div>
              <p class="sub-label">Expiration</p>
              <p id="card-expiry-display">MM/AA</p>
            </div>
            <div class="right">
              <p class="sub-label">CVC</p>
              <p id="card-cvc-display">â€¢â€¢â€¢</p>
            </div>
          </div>
        </div>
      </div>

      <!-- inputmode="numeric" : ouvre le clavier numÃ©rique sur mobile sans changer le type rÃ©el de l'input (reste "text" pour permettre le formatage avec espaces / slash) -->
      <!--
        GUIDE HTML / PHP :
        - Ajouter method="post" lorsque le traitement serveur sera pret.
        - Ajouter des name="..." si les champs doivent etre lus avec $_POST.
        - Garder ce paiement fictif : ne pas enregistrer de vraies donnees bancaires.
        - Cote serveur, valider le formulaire puis creer la commande.
      -->
      <form id="payment-form" class="pay-form">
        <div class="field pay-field">
          <label for="pay-card">NumÃ©ro de carte</label>
          <input type="text" id="pay-card" placeholder="1234 5678 9012 3456" maxlength="19" inputmode="numeric" />
        </div>
        <div class="pay-row">
          <div class="field pay-field">
            <label for="pay-expiry">Date d'expiration</label>
            <input type="text" id="pay-expiry" placeholder="MM/AA" maxlength="5" inputmode="numeric" />
          </div>
          <div class="field pay-field">
            <label for="pay-cvc">CVC</label>
            <input type="text" id="pay-cvc" placeholder="123" maxlength="4" inputmode="numeric" />
          </div>
        </div>

        <!-- GUIDE PHP : afficher ici les erreurs serveur du paiement fictif. -->
        <p class="error-msg" id="payment-error" style="display:none;"></p>

        <button type="submit" class="btn-primary pay-submit" id="payment-submit">Payer 0.00 â‚¬ TTC</button>
      </form>
    </div>

    <!-- Colonne droite : rÃ©capitulatif de commande, collant (sticky) pendant le scroll -->
    <div class="summary-panel">
      <div class="summary-card">
        <div class="summary-head"><h2>RÃ©capitulatif</h2></div>
        <div class="summary-content">
          <!-- Rempli par renderPayment() dans app.js Ã  partir du panier -->
          <!--
            GUIDE PHP :
            - Remplacer #summary-items par une boucle sur le panier serveur.
            - Afficher nom, quantite et total de ligne.
            - Recalculer les montants en PHP avant affichage.
          -->
          <div class="summary-items" id="summary-items"></div>
          <div class="summary-totals">
            <div class="trow"><span class="label">Total HT</span><span class="value" id="summary-total-ht">0.00 â‚¬</span></div>
            <div class="trow"><span class="label muted" id="summary-tva-label">TVA 10 %</span><span class="value muted" id="summary-tva-value">0.00 â‚¬</span></div>
            <div class="trow total-row"><span class="label">Total TTC</span><span class="value" id="summary-total-ttc">0.00 â‚¬</span></div>
          </div>
          <div class="summary-mode" id="summary-mode">ðŸ½ï¸ Sur place</div>
        </div>
      </div>
    </div>
  </div>
</div>


<script src="js/data.js"></script>
<script src="js/app.js"></script>
</body>
</html>


