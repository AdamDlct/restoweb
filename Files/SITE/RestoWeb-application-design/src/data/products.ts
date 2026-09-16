export interface Product {
  id: number;
  name: string;
  description: string;
  priceHT: number;
  category: string;
  emoji: string;
  imageUrl: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1, name: "Soupe à l'oignon", description: "Gratinée, bouillon de bœuf, comté",
    priceHT: 8.50, category: "Entrées", emoji: "🍲",
    imageUrl: "https://images.unsplash.com/photo-1741318714411-fad939b8580a?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 2, name: "Salade niçoise", description: "Thon, œuf mollet, olives, anchois",
    priceHT: 10.00, category: "Entrées", emoji: "🥗",
    imageUrl: "https://images.unsplash.com/photo-1784981260317-b97ef0163129?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 3, name: "Tartare de saumon", description: "Avocat, citron vert, aneth",
    priceHT: 12.50, category: "Entrées", emoji: "🐟",
    imageUrl: "https://images.unsplash.com/photo-1692197275441-40c874f40385?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 4, name: "Bœuf bourguignon", description: "Joue de bœuf, lardons, champignons, pommes de terre",
    priceHT: 18.00, category: "Plats", emoji: "🥩",
    imageUrl: "https://images.unsplash.com/photo-1667396702543-a239efa7a7f2?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 5, name: "Magret de canard", description: "Sauce aux cerises, gratin dauphinois",
    priceHT: 22.00, category: "Plats", emoji: "🍗",
    imageUrl: "https://images.unsplash.com/photo-1607403217872-27422b4ece0b?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 6, name: "Risotto aux cèpes", description: "Parmesan affiné 24 mois, truffe",
    priceHT: 16.50, category: "Plats", emoji: "🍚",
    imageUrl: "https://images.unsplash.com/photo-1704229680062-6ae5950e1ebc?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 7, name: "Pavé de saumon", description: "Beurre blanc citronné, légumes vapeur",
    priceHT: 19.00, category: "Plats", emoji: "🐠",
    imageUrl: "https://images.unsplash.com/photo-1590794536482-e4b52bb38342?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 8, name: "Burger bistro", description: "Bœuf charolais, cheddar, oignons confits",
    priceHT: 14.00, category: "Plats", emoji: "🍔",
    imageUrl: "https://images.unsplash.com/photo-1777994505601-fe18ab41f8f0?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 9, name: "Crème brûlée", description: "Vanille Bourbon, caramel croustillant",
    priceHT: 7.00, category: "Desserts", emoji: "🍮",
    imageUrl: "https://images.unsplash.com/photo-1550502385-569f695037c5?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 10, name: "Moelleux chocolat", description: "Cœur coulant, crème anglaise",
    priceHT: 7.50, category: "Desserts", emoji: "🍫",
    imageUrl: "https://images.unsplash.com/photo-1585504455924-3d3b0eb2b8ee?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 11, name: "Tarte tatin", description: "Pommes caramélisées, crème fraîche",
    priceHT: 6.50, category: "Desserts", emoji: "🥧",
    imageUrl: "https://images.unsplash.com/photo-1505252929202-c4f39cda4d49?w=400&h=280&fit=crop&auto=format",
  },
  {
    id: 12, name: "Café gourmand", description: "Expresso + 3 mignardises maison",
    priceHT: 5.50, category: "Boissons", emoji: "☕",
    imageUrl: "https://images.unsplash.com/photo-1638518963806-4d27451f3fa2?w=400&h=280&fit=crop&auto=format",
  },
];

export const CATEGORIES = ["Entrées", "Plats", "Desserts", "Boissons"] as const;
