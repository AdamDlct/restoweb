import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import CatalogPage from "./pages/CatalogPage";
import CartPage from "./pages/CartPage";
import PaymentPage from "./pages/PaymentPage";
import TrackingPage from "./pages/TrackingPage";
import { CartItem, OrderMode } from "./types";

export type Page = "auth" | "catalog" | "cart" | "payment" | "tracking";

export default function App() {
  const [page, setPage] = useState<Page>("auth");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<OrderMode>("surplace");
  const [orderId] = useState(() => Math.floor(Math.random() * 9000) + 1000);

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

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id));
    } else {
      setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
    }
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div className="min-h-full">
      {page === "auth" && (
        <AuthPage
          onLogin={() => {
            setIsLoggedIn(true);
            setPage("catalog");
          }}
        />
      )}
      {page === "catalog" && isLoggedIn && (
        <CatalogPage
          cart={cart}
          totalItems={totalItems}
          addToCart={addToCart}
          onGoToCart={() => setPage("cart")}
        />
      )}
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
      {page === "payment" && (
        <PaymentPage
          cart={cart}
          orderMode={orderMode}
          onBack={() => setPage("cart")}
          onConfirm={() => setPage("tracking")}
        />
      )}
      {page === "tracking" && (
        <TrackingPage orderId={orderId} orderMode={orderMode} />
      )}
    </div>
  );
}
