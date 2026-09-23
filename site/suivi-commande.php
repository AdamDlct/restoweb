<?php
include("db_functions.php");

try {
  $dbh = db_connect();
  $result = $dbh->query('SELECT * FROM commande;');
  $rows = $result->fetchAll();
} catch (PDOException $e) {
  die("<p>Erreur lors de la requête SQL : " . $e->getMessage() . "</p>");
}



$commande = $rows[0];

$id_commande = $commande["id_commande"];
$id_etat = $commande["id_etat"];
$date_commande = $commande["date_commande"];
$total_commande = $commande["total_commande"];
// $type_conso     = $commande["type_conso"];
$type_conso = 0;


// print_r($rows);
// print_r($_SESSION);
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
      <span class="order-badge" id="tracking-order-id"><?php echo "#";
      printf("%04d", $id_commande) ?></span>
    </header>

    <div class="tracking-body">
      <!-- Colonne gauche : statut courant + barre de progression -->
      <div class="tracking-left">
        <div class="status-card">
          <!-- Halo de couleur en fond, purement décoratif -->
          <div class="status-glow">
            <div class="blob" id="status-blob"></div>
          </div>
          <div class="status-content">
            <!--
          GUIDE PHP :
          - Remplacer emoji, titre et description selon le statut serveur.
          - Statuts possibles : en attente, en preparation, prete, servie.
          - Verifier que la commande appartient a l'utilisateur connecte avant affichage.
        -->
            <span class="status-emoji" id="status-emoji">⏳</span>
            <h1 class="status-title" id="status-title">En attente</h1>
            <p class="status-desc" id="status-desc">Votre commande a été reçue et est en file d'attente.</p>
          </div>
        </div>

        <!-- Notification "commande prête" : masquée par défaut, affichée par app.js à la bonne étape -->
        <div class="notif" id="tracking-notif">
          <span class="icon">👨‍🍳</span>
          <span class="text" id="tracking-notif-text">Votre plat arrive !</span>
        </div>

        <div class="progress-box">
          <div class="progress-track">
            <!-- GUIDE PHP : la progression pourra dependre du statut reel de la commande. -->
            <div class="progress-fill" id="progress-fill"></div>
          </div>
          <!-- Les 4 étapes (⏳ 👨‍🍳 🍽️ ✔️) sont générées par app.js à partir du tableau STATES -->
          <div class="steps-row" id="steps-row"></div>
        </div>

        <!-- Visible uniquement à la toute dernière étape ("servie") -->
        <button type="button" class="new-order-btn" id="new-order-btn">Nouvelle commande</button>
      </div>

      <!-- Colonne droite : détails de la commande + photo décorative -->
      <div class="tracking-right">
        <div class="details-card">
          <h3>Détails</h3>
          <div class="details-grid">
            <!--
            GUIDE PHP :
            - Remplacer les placeholders par les informations de la commande en base.
            - Ne pas afficher une commande qui n'appartient pas a l'utilisateur connecte.
            - Le temps estime peut etre fixe, calcule, ou stocke en base selon le projet.
          -->
            <div>
              <p class="dt-label">Commande</p>
              <p class="dt-value accent" id="detail-order-id"><?php echo "#";
              printf("%04d", $id_commande) ?></p>
            </div>
            <div>
              <p class="dt-label">Mode</p>
              <?php

              echo $type_conso ? "<p class='dt-value' id='detail-mode'>🍽️ Sur place</p>" : "<p class='dt-value' id='detail-mode'>🥡 A emporter</p>";

              ?>

            </div>
            <div class="full">
              <p class="dt-label">Statut</p>
              <span class="status-pill" id="detail-status">⏳ En attente</span>
            </div>
            <div class="full">
              <p class="dt-label">Temps estimé</p>
              <p class="dt-value mono" id="detail-eta">~15 min</p>
            </div>
          </div>
        </div>

        <div class="food-photo">
          <img src="https://images.unsplash.com/photo-1675670601305-3e04ec45430f?w=600&h=400&fit=crop&auto=format"
            alt="Plat gastronomique Resto Web" />
          <div class="food-photo-gradient"></div>
          <div class="food-photo-text">
            <p>Cuisine de saison · Produits locaux</p>
          </div>
        </div>
      </div>
    </div>
  </div>


  <script src="js/data.js"></script>
  <script src="js/app.js"></script>
</body>

</html>