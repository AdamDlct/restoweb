<?php
/*
  ============================================================================
  PAGE CATALOGUE
  ============================================================================
  - Affiche les produits de la table produit.
    Filtre par categorie avec l'URL : catalogue.php?categorie=Plats
  - Chaque produit a un formulaire (id_produit + qte) envoye en POST
    quand on clique sur "Ajouter".
  - Chaque unite ajoutee = une ligne dans ligne_commande (qte = 1) :
    voir ajouter_au_panier() dans panier_functions.php.
  - Le total du panier (TTC) est calcule par les triggers.
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

// Categorie choisie dans les filtres ("" = tous les produits)
$categorie = $_GET['categorie'] ?? '';

// ---------------------------------------------------------------------------
// 2. Bouton "Ajouter" d'un produit
// ---------------------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
  $id_produit = (int) ($_POST['id_produit'] ?? 0);
  $qte        = (int) ($_POST['qte'] ?? 1);
  ajouter_au_panier($dbh, $id_user, $id_produit, $qte);

  // On recharge le catalogue au niveau du produit ajoute
  // (evite aussi de renvoyer le formulaire si on fait F5)
  header('Location: catalogue.php?categorie=' . urlencode($categorie) . '&ajoute=' . $id_produit . '#produit-' . $id_produit);
  exit;
}

// Produit qui vient d'etre ajoute : son bouton affiche "✓ Ajouté"
$ajoute = (int) ($_GET['ajoute'] ?? 0);

// ---------------------------------------------------------------------------
// 3. Categories (dans l'ordre de la carte) et produits
// ---------------------------------------------------------------------------
$categories = $dbh->query("SELECT categorie FROM produit WHERE categorie IS NOT NULL GROUP BY categorie ORDER BY MIN(id_produit)")->fetchAll(PDO::FETCH_COLUMN);

if ($categorie == '') {
  $sth = $dbh->prepare("SELECT * FROM produit ORDER BY id_produit");
  $sth->execute();
} else {
  $sth = $dbh->prepare("SELECT * FROM produit WHERE categorie = :categorie ORDER BY id_produit");
  $sth->execute(array(':categorie' => $categorie));
}
$produits = $sth->fetchAll(PDO::FETCH_ASSOC);

// ---------------------------------------------------------------------------
// 4. Resume du panier (bouton en haut + barre en bas)
// ---------------------------------------------------------------------------
$nb_articles = 0;
$total_ttc   = 0;
$commande    = panier_en_cours($dbh, $id_user);
if ($commande) {
  $sth = $dbh->prepare("SELECT COUNT(*) FROM ligne_commande WHERE id_commande = :id_commande");
  $sth->execute(array(':id_commande' => $commande['id_commande']));
  $nb_articles = $sth->fetchColumn();                // une ligne = une unite
  $total_ttc   = $commande['total_commande'];        // calcule par le trigger
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
  /* Styles propres a cette page (le catalogue est genere en PHP, sans app.js) */
  a.catalog-cart-btn,
  a.category-chip,
  a.floating-cart-btn { text-decoration: none; }

  /* Champ quantite dans le stepper [ - 1 + ] */
  .qty-stepper input {
    width: 30px;
    border: 0;
    background: none;
    text-align: center;
    font-size: 0.875rem;
    font-family: var(--font-mono-face);
    color: var(--foreground);
    -moz-appearance: textfield;
  }
  .qty-stepper input::-webkit-outer-spin-button,
  .qty-stepper input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

  .product-card { scroll-margin-top: 90px; }   /* le produit ajoute n'est pas cache par l'en-tete */
  .catalog-body { padding-bottom: 110px; }      /* place pour la barre "Voir mon panier" */
  .floating-cart-btn { white-space: nowrap; }
</style>
</head>
<body>

<div id="page-catalog" class="page active">

  <!-- En-tete : bouton panier avec le nombre d'articles et le total TTC -->
  <header class="topbar">
    <div class="brand brand-lg">
      <span>Resto</span><span> Web</span>
    </div>
    <a href="panier.php" class="catalog-cart-btn<?php if ($nb_articles > 0) echo ' has-items'; ?>">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <?php if ($nb_articles > 0) { ?>
        <span class="cart-badge"><?php echo $nb_articles; ?></span>
        <span><?php echo prix($total_ttc); ?> TTC</span>
      <?php } else { ?>
        <span>Panier</span>
      <?php } ?>
    </a>
  </header>

  <!-- Bannière photo -->
  <div class="catalog-hero">
    <img src="images/backcatalogue.png" alt="Salle du restaurant Resto Web" />
    <div class="catalog-hero-gradient"></div>
    <div class="catalog-hero-text">
      <h1>Notre <em>carte</em></h1>
      <p>Produits frais · Recettes maison · Commandez directement depuis votre table</p>
    </div>
  </div>

  <div class="catalog-body">

    <!-- Filtres : un lien par categorie -->
    <div class="category-filters">
      <a href="catalogue.php" class="category-chip<?php if ($categorie == '') echo ' active'; ?>">Tous</a>
      <?php foreach ($categories as $cat) { ?>
        <a href="catalogue.php?categorie=<?php echo urlencode($cat); ?>" class="category-chip<?php if ($cat == $categorie) echo ' active'; ?>"><?php echo htmlspecialchars($cat); ?></a>
      <?php } ?>
    </div>

    <!-- Grille des produits -->
    <div class="product-grid">
      <?php foreach ($produits as $produit) { ?>
        <div class="product-card" id="produit-<?php echo $produit['id_produit']; ?>">
          <div class="product-card-photo">
            <?php if ($produit['image']) { ?>
              <img class="product-card-img" src="images/<?php echo rawurlencode($produit['image']); ?>" alt="<?php echo htmlspecialchars($produit['libelle']); ?>" />
            <?php } ?>
            <div class="product-card-fade"></div>
            <span class="product-card-badge"><?php echo htmlspecialchars($produit['categorie'] ?? ''); ?></span>
          </div>

          <div class="product-card-info">
            <div>
              <h3><?php echo htmlspecialchars($produit['libelle']); ?></h3>
              <p class="desc"><?php echo htmlspecialchars($produit['description'] ?? ''); ?></p>
            </div>

            <div class="product-card-footer">
              <div class="product-card-price">
                <span class="amount"><?php echo number_format($produit['prix_ht'], 2, '.', ' '); ?></span><span class="unit">€ HT</span>
              </div>

              <!-- Formulaire d'ajout : id du produit + quantite choisie -->
              <form class="product-card-actions" method="post" action="catalogue.php?categorie=<?php echo urlencode($categorie); ?>">
                <input type="hidden" name="id_produit" value="<?php echo $produit['id_produit']; ?>" />
                <div class="qty-stepper">
                  <button type="button" onclick="this.nextElementSibling.stepDown()">−</button>
                  <input type="number" name="qte" value="1" min="1" max="20" aria-label="Quantité" />
                  <button type="button" onclick="this.previousElementSibling.stepUp()">+</button>
                </div>
                <?php if ($produit['id_produit'] == $ajoute) { ?>
                  <button type="submit" class="add-btn added">✓ Ajouté</button>
                <?php } else { ?>
                  <button type="submit" class="add-btn">Ajouter</button>
                <?php } ?>
              </form>
            </div>
          </div>
        </div>
      <?php } ?>
    </div>
  </div>

  <!-- Barre "Voir mon panier", affichee seulement si le panier n'est pas vide -->
  <?php if ($nb_articles > 0) { ?>
    <div class="floating-cart visible">
      <a href="panier.php" class="floating-cart-btn">
        <span class="floating-cart-badge"><?php echo $nb_articles; ?></span>
        <span>Voir mon panier</span>
        <span class="floating-cart-total"><?php echo prix($total_ttc); ?> TTC</span>
      </a>
    </div>
  <?php } ?>
</div>

</body>
</html>
