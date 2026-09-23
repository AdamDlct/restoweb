<?php
/*
  ============================================================================
  INTEGRATION PHP - PAGE CATALOGUE / CHOIX DES PRODUITS
  ============================================================================
  Objectif futur :
  - Demarrer la session avec session_start().
  - Verifier que l'utilisateur est connecte avant d'afficher la page.
  - Recuperer les categories depuis la base de donnees.
  - Recuperer les produits depuis la base de donnees.
  - Remplacer les donnees JavaScript statiques par des donnees issues de SQL.
  - Permettre l'ajout au panier via POST ou via une route PHP dediee.

  A prevoir :
  - Une requete SELECT pour les produits disponibles.
  - Une requete SELECT pour les categories.
  - Une verification du stock ou de la disponibilite si necessaire.
  - Un lien vers deconnexion.php dans l'interface.

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

<!-- Page Catalogue extraite de l'ancienne SPA index.html. -->
<div id="page-catalog" class="page active">

  <!-- En-tête collant en haut de l'écran (position: sticky en CSS) -->
  <header class="topbar">
    <div class="brand brand-lg">
      <span>Resto</span><span> Web</span>
    </div>
    <!-- data-nav n'est PAS utilisé ici : ce bouton a un id dédié car il doit aussi afficher le total du panier -->
    <!--
      GUIDE HTML / PHP :
      - Afficher ici le nombre d'articles du panier stocke en session.
      - Ajouter plus tard un lien de deconnexion si l'utilisateur est connecte.
      - Le bouton panier pourra devenir un vrai lien vers panier.php.
    -->
    <button type="button" class="catalog-cart-btn" id="catalog-cart-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <span class="cart-badge" id="catalog-cart-badge" style="display:none;"></span>
      <span id="catalog-cart-label">Panier</span>
    </button>
  </header>

  <!-- Bannière photo -->
  <div class="catalog-hero">
    <img src="https://images.unsplash.com/photo-1657593088889-5105c637f2a8?w=1400&h=500&fit=crop&auto=format" alt="Salle du restaurant Resto Web" />
    <div class="catalog-hero-gradient"></div>
    <div class="catalog-hero-text">
      <h1>Notre <em>carte</em></h1>
      <p>Produits frais · Recettes maison · Commandez directement depuis votre table</p>
    </div>
  </div>

  <!-- Zone principale : filtres + grille de produits, générés par app.js (renderCategoryFilters / renderProductGrid) -->
  <div class="catalog-body">
    <!-- GUIDE PHP : remplacer ce conteneur par une boucle sur les categories SQL, avec htmlspecialchars() sur les libelles. -->
    <div class="category-filters" id="category-filters"></div>
    <!--
      GUIDE PHP :
      - Remplacer cette grille par une boucle sur les produits de la base.
      - Chaque produit pourra contenir un formulaire POST d'ajout au panier.
      - Envoyer id_produit et quantite seulement ; relire le prix en base cote serveur.
    -->
    <div class="product-grid" id="product-grid"></div>
  </div>

  <!-- Barre flottante "Voir mon panier", cachée tant que le panier est vide (classe .visible ajoutée par app.js) -->
  <div class="floating-cart" id="floating-cart">
    <button type="button" class="floating-cart-btn" id="floating-cart-btn">
      <span class="floating-cart-badge" id="floating-cart-badge">0</span>
      <span>Voir mon panier</span>
      <span class="floating-cart-total" id="floating-cart-total">0.00 €</span>
    </button>
  </div>
</div>


<script src="js/data.js"></script>
<script src="js/app.js"></script>
</body>
</html>


