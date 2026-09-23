<?php
/*
  ============================================================================
  INTEGRATION PHP - PAGE SUIVI DE COMMANDE
  ============================================================================
  Objectif futur :
  - Demarrer la session avec session_start().
  - Verifier que l'utilisateur est connecte.
  - Recuperer l'identifiant de commande depuis l'URL ou la session.
  - Charger les informations de la commande depuis la base de donnees.
  - Afficher le numero, le mode, le statut et le temps estime.
  - Mettre a jour l'affichage selon le statut reel de la commande.

  A prevoir :
  - Verifier que la commande appartient bien a l'utilisateur connecte.
  - Prevoir les statuts possibles : en attente, en preparation, prete, servie.
  - Remplacer progressivement la simulation JavaScript par des donnees PHP/SQL.
  - Eventuellement rafraichir le statut avec une requete AJAX plus tard.

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

<!-- Page Suivi de commande extraite de l'ancienne SPA index.html. -->
<div id="page-tracking" class="page active">
  <header class="tracking-header">
    <div class="brand brand-lg">
      <span>Resto</span><span> Web</span>
    </div>
    <!-- GUIDE PHP : remplacer #0000 par le numero de commande lu depuis la base. -->
    <span class="order-badge" id="tracking-order-id">#0000</span>
  </header>

  <div class="tracking-body">
    <!-- Colonne gauche : statut courant + barre de progression -->
    <div class="tracking-left">
      <div class="status-card">
        <!-- Halo de couleur en fond, purement dÃ©coratif -->
        <div class="status-glow"><div class="blob" id="status-blob"></div></div>
        <div class="status-content">
          <!--
          GUIDE PHP :
          - Remplacer emoji, titre et description selon le statut serveur.
          - Statuts possibles : en attente, en preparation, prete, servie.
          - Verifier que la commande appartient a l'utilisateur connecte avant affichage.
        -->
          <span class="status-emoji" id="status-emoji">â³</span>
          <h1 class="status-title" id="status-title">En attente</h1>
          <p class="status-desc" id="status-desc">Votre commande a Ã©tÃ© reÃ§ue et est en file d'attente.</p>
        </div>
      </div>

      <!-- Notification "commande prÃªte" : masquÃ©e par dÃ©faut, affichÃ©e par app.js Ã  la bonne Ã©tape -->
      <div class="notif" id="tracking-notif">
        <span class="icon">ðŸ””</span>
        <span class="text" id="tracking-notif-text">Votre plat arrive !</span>
      </div>

      <div class="progress-box">
        <div class="progress-track">
          <!-- GUIDE PHP : la progression pourra dependre du statut reel de la commande. -->
          <div class="progress-fill" id="progress-fill"></div>
        </div>
        <!-- Les 4 Ã©tapes (â³ ðŸ‘¨â€ðŸ³ ðŸ”” âœ…) sont gÃ©nÃ©rÃ©es par app.js Ã  partir du tableau STATES -->
        <div class="steps-row" id="steps-row"></div>
      </div>

      <!-- Visible uniquement Ã  la toute derniÃ¨re Ã©tape ("servie") -->
      <button type="button" class="new-order-btn" id="new-order-btn">Nouvelle commande</button>
    </div>

    <!-- Colonne droite : dÃ©tails de la commande + photo dÃ©corative -->
    <div class="tracking-right">
      <div class="details-card">
        <h3>DÃ©tails</h3>
        <div class="details-grid">
          <!--
            GUIDE PHP :
            - Remplacer les placeholders par les informations de la commande en base.
            - Ne pas afficher une commande qui n'appartient pas a l'utilisateur connecte.
            - Le temps estime peut etre fixe, calcule, ou stocke en base selon le projet.
          -->
          <div>
            <p class="dt-label">Commande</p>
            <p class="dt-value accent" id="detail-order-id">#0000</p>
          </div>
          <div>
            <p class="dt-label">Mode</p>
            <p class="dt-value" id="detail-mode">ðŸ½ï¸ Sur place</p>
          </div>
          <div class="full">
            <p class="dt-label">Statut</p>
            <span class="status-pill" id="detail-status">â³ En attente</span>
          </div>
          <div class="full">
            <p class="dt-label">Temps estimÃ©</p>
            <p class="dt-value mono" id="detail-eta">~15 min</p>
          </div>
        </div>
      </div>

      <div class="food-photo">
        <img src="https://images.unsplash.com/photo-1675670601305-3e04ec45430f?w=600&h=400&fit=crop&auto=format" alt="Plat gastronomique Resto Web" />
        <div class="food-photo-gradient"></div>
        <div class="food-photo-text">
          <p>Cuisine de saison Â· Produits locaux</p>
        </div>
      </div>
    </div>
  </div>
</div>


<script src="js/data.js"></script>
<script src="js/app.js"></script>
</body>
</html>


