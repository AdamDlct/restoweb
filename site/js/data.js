// ============================================================================
// data.js — "base de données" du site (aucun vrai serveur/BDD ici)
// ============================================================================
// Principe : on sépare les DONNÉES (ce fichier) du COMPORTEMENT (app.js).
// PRODUCTS et CATEGORIES sont de simples variables globales (déclarées avec
// "const") : comme ce fichier est chargé AVANT app.js dans index.html
// (<script src="js/data.js"> puis <script src="js/app.js">), app.js peut
// utiliser PRODUCTS/CATEGORIES directement, sans import ni export.
// ============================================================================

// Liste des plats de la carte, utilisée par renderProductGrid() dans app.js.
const PRODUCTS = [
  {
    id: 1, name: "Soupe à l'oignon", description: "Gratinée, bouillon de bœuf, comté",
    priceHT: 8.50, category: "Entrées", emoji: "🍲",
    imageUrl: "images/Soupeà l'oignon.jpg",
  },
  {
    id: 2, name: "Salade niçoise", description: "Thon, œuf mollet, olives, anchois",
    priceHT: 10.00, category: "Entrées", emoji: "🥗",
    imageUrl: "images/Salade nicoise.jpg",
  },
  {
    id: 3, name: "Tartare de saumon", description: "Avocat, citron vert, aneth",
    priceHT: 12.50, category: "Entrées", emoji: "🐟",
    imageUrl: "images/Tartare de saumon.jpg",
  },
  {
    id: 4, name: "Bœuf bourguignon", description: "Joue de bœuf, lardons, champignons, pommes de terre",
    priceHT: 18.00, category: "Plats", emoji: "🥩",
    imageUrl: "images/Boeuf bourguignon.png",
  },
  {
    id: 5, name: "Magret de canard", description: "Sauce aux cerises, gratin dauphinois",
    priceHT: 22.00, category: "Plats", emoji: "🍗",
    imageUrl: "images/Magret de canard.jpg",
  },
  {
    id: 6, name: "Risotto aux cèpes", description: "Parmesan affiné 24 mois, truffe",
    priceHT: 16.50, category: "Plats", emoji: "🍚",
    imageUrl: "images/Risotto aux cèpes.jpg",
  },
  {
    id: 7, name: "Steak frites", description: "Pièce du boucher, sauce au poivre, frites maison",
    priceHT: 19.00, category: "Plats", emoji: "🐠",
    imageUrl: "images/Steak frites.jpg",
  },
  {
    id: 8, name: "Burger bistro", description: "Bœuf charolais, cheddar, oignons confits, frites maison",
    priceHT: 14.00, category: "Plats", emoji: "🍔",
    imageUrl: "images/Burger bistro.jpg",
  },
  {
    id: 9, name: "Crème brûlée", description: "Vanille Bourbon, caramel croustillant",
    priceHT: 7.00, category: "Desserts", emoji: "🍮",
    imageUrl: "images/Crême brulée.jpg",
  },
  {
    id: 10, name: "Fondant chocolat", description: "Cœur coulant, crème anglaise",
    priceHT: 7.50, category: "Desserts", emoji: "🍫",
    imageUrl: "images/Fondant chocolat.jpg",
  },
  {
    id: 11, name: "Tarte tatin", description: "Pommes caramélisées, crème fraîche",
    priceHT: 6.50, category: "Desserts", emoji: "🥧",
    imageUrl: "images/Tarte tatin.jpg",
  },
  {
    id: 12, name: "Café gourmand", description: "Expresso + 3 mignardises maison",
    priceHT: 5.50, category: "Boissons", emoji: "☕",
    imageUrl: "images/Café gourmand.jpg",
  },
];

// Catégories utilisées pour filtrer la carte.
const CATEGORIES = ["Entrées", "Plats", "Desserts", "Boissons"];
