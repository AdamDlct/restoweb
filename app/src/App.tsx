import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import CatalogPage from "./pages/CatalogPage";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import TrackingPage from "./pages/TrackingPage";
import { CartItem, OrderMode } from "./types";

// Liste des écrans de l'application. La navigation est gérée ici, sans routeur
// externe : App garde l'état `page` et affiche le composant correspondant.
export type Page = "auth" | "catalog" | "cart" | "payment" | "tracking";

export default function App() {
  // Écran actuellement affiché.
  const [page, setPage] = useState<Page>("auth");
  // Empêche l'accès direct à la carte tant que l'utilisateur ne s'est pas "connecté".
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Panier global, partagé entre CatalogPage, CartPage et PaymentPage.
  const [cart, setCart] = useState<CartItem[]>([]);
  // Mode de consommation (sur place / à emporter), impacte le taux de TVA appliqué.
  const [orderMode, setOrderMode] = useState<OrderMode>("surplace");
  // Numéro de commande généré une seule fois au montage (simulateur, pas de backend réel).
  const [orderId] = useState(() => Math.floor(Math.random() * 9000) + 1000);

  // Ajoute un produit au panier ; si le produit existe déjà, additionne les quantités.
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + item.qty } : c
        );
      }
      return [...prev, item];
    });
  };

  // Modifie la quantité d'un article ; le retire du panier si la quantité tombe à 0 ou moins.
  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id));
    } else {
      setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
    }
  };

  // Supprime complètement un article du panier, quelle que soit sa quantité.
  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  // Nombre total d'articles (toutes quantités confondues), affiché sur le badge du panier.
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div className="min-h-full">
      {/* Écran de connexion / inscription, point d'entrée de l'application */}
      {page === "auth" && (
        <AuthPage
          onLogin={() => {
            setIsLoggedIn(true);
            setPage("catalog");
          }}
        />
      )}
      {/* Carte des produits, accessible uniquement après connexion */}
      {page === "catalog" && isLoggedIn && (
        <CatalogPage
          cart={cart}
          totalItems={totalItems}
          addToCart={addToCart}
          onGoToCart={() => setPage("cart")}
        />
      )}
      {/* Récapitulatif du panier avant paiement */}
      {page === "cart" && (
        <CartPage
          cart={cart}
          orderMode={orderMode}
          setOrderMode={setOrderMode}
          updateQty={updateQty}
          removeItem={removeItem}
          onBack={() => setPage("catalog")}
          onPay={() => setPage("payment")}
        />
      )}
      {/* Formulaire de paiement fictif */}
      {page === "payment" && (
        <PaymentPage
          cart={cart}
          orderMode={orderMode}
          onBack={() => setPage("cart")}
          onConfirm={() => setPage("tracking")}
        />
      )}
      {/* Suivi de commande en temps simulé (statuts qui s'enchaînent automatiquement) */}
      {page === "tracking" && (
        <TrackingPage orderId={orderId} orderMode={orderMode} />
      )}
    </div>
  );
}
