import { useState } from "react";
import { PRODUCTS, CATEGORIES, Product } from "../data/products";
import { CartItem } from "../types";

interface Props {
  cart: CartItem[];
  totalItems: number;
  addToCart: (item: CartItem) => void;
  onGoToCart: () => void;
}

const HERO_IMG = "https://images.unsplash.com/photo-1657593088889-5105c637f2a8?w=1400&h=500&fit=crop&auto=format";

export default function CatalogPage({ cart, totalItems, addToCart, onGoToCart }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [qtys, setQtys] = useState<Record<number, number>>({});
  const [added, setAdded] = useState<Record<number, boolean>>({});

  const categories = ["Tous", ...CATEGORIES];
  const filtered = activeCategory === "Tous" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);
  const getQty = (id: number) => qtys[id] ?? 1;

  const handleAdd = (product: Product) => {
    addToCart({ id: product.id, name: product.name, priceHT: product.priceHT, qty: getQty(product.id) });
    setAdded((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [product.id]: false })), 1400);
  };

  const totalHT = cart.reduce((s, c) => s + c.priceHT * c.qty, 0);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Sticky header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 border-b"
        style={{ background: "rgba(26,19,16,0.92)", borderColor: "var(--border)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-1">
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--accent)", fontSize: "1.2rem" }}>Bistro</span>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)", fontSize: "1.2rem" }}> Moderne</span>
        </div>
        <button
          onClick={onGoToCart}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full transition-all hover:opacity-90 active:scale-95"
          style={{ background: totalItems > 0 ? "var(--primary)" : "var(--secondary)", color: totalItems > 0 ? "var(--primary-foreground)" : "var(--muted-foreground)", fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 600, border: "1px solid var(--border)", boxShadow: totalItems > 0 ? "0 4px 16px rgba(232,132,90,0.3)" : "none", transition: "all 0.2s" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {totalItems > 0 && (
            <span className="flex items-center justify-center rounded-full text-xs font-bold" style={{ minWidth: 20, height: 20, background: "var(--primary-foreground)", color: "var(--primary)" }}>
              {totalItems}
            </span>
          )}
          <span>{totalHT > 0 ? `${totalHT.toFixed(2)} € HT` : "Panier"}</span>
        </button>
      </header>

      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ height: 220 }}>
        <img
          src={HERO_IMG}
          alt="Salle du restaurant Bistro Moderne"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.45)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 30%, var(--background) 100%)" }}
        />
        <div className="absolute inset-0 flex flex-col justify-end px-8 pb-8">
          <h1 className="text-5xl" style={{ fontFamily: "var(--font-serif)", color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
            Notre <em style={{ color: "var(--accent)" }}>carte</em>
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            Produits frais · Recettes maison · Commandez directement depuis votre table
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150"
              style={{
                background: activeCategory === cat ? "var(--primary)" : "var(--secondary)",
                color: activeCategory === cat ? "var(--primary-foreground)" : "var(--muted-foreground)",
                border: `1px solid ${activeCategory === cat ? "transparent" : "var(--border)"}`,
                boxShadow: activeCategory === cat ? "0 2px 12px rgba(232,132,90,0.28)" : "none",
                fontFamily: "var(--font-sans)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              qty={getQty(product.id)}
              isAdded={!!added[product.id]}
              onQtyChange={(delta) => setQtys((q) => ({ ...q, [product.id]: Math.max(1, getQty(product.id) + delta) }))}
              onAdd={() => handleAdd(product)}
            />
          ))}
        </div>
      </div>

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={onGoToCart}
            className="flex items-center gap-4 px-7 py-3.5 rounded-full shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-sans)", fontWeight: 600, boxShadow: "0 8px 40px rgba(232,132,90,0.45)" }}
          >
            <span className="flex items-center justify-center rounded-full text-xs font-bold w-6 h-6" style={{ background: "var(--primary-foreground)", color: "var(--primary)" }}>
              {totalItems}
            </span>
            <span>Voir mon panier</span>
            <span style={{ fontFamily: "var(--font-mono-face)", opacity: 0.85 }}>{totalHT.toFixed(2)} €</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, qty, isAdded, onQtyChange, onAdd }: {
  product: Product;
  qty: number;
  isAdded: boolean;
  onQtyChange: (delta: number) => void;
  onAdd: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:translate-y-[-3px]"
      style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: 170, background: "var(--secondary)" }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.4s, transform 0.5s" }}
          onLoad={() => setImgLoaded(true)}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-4xl" style={{ color: "var(--muted-foreground)" }}>
            {product.emoji}
          </div>
        )}
        {/* Gradient fade into card */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: "linear-gradient(to top, var(--card), transparent)" }}
        />
        {/* Category badge */}
        <span
          className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: "rgba(26,19,16,0.75)", color: "var(--accent)", backdropFilter: "blur(8px)", border: "1px solid rgba(232,132,90,0.25)", fontFamily: "var(--font-sans)" }}
        >
          {product.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-base leading-snug" style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
            {product.name}
          </h3>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div>
            <span className="text-xl font-semibold" style={{ color: "var(--accent)", fontFamily: "var(--font-mono-face)" }}>
              {product.priceHT.toFixed(2)}
            </span>
            <span className="text-xs ml-1" style={{ color: "var(--muted-foreground)" }}>€ HT</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Qty stepper */}
            <div
              className="flex items-center rounded-lg overflow-hidden"
              style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}
            >
              <button
                onClick={() => onQtyChange(-1)}
                className="w-7 h-7 flex items-center justify-center text-sm hover:opacity-60 transition-opacity"
                style={{ color: "var(--foreground)" }}
              >
                −
              </button>
              <span className="w-6 text-center text-sm" style={{ color: "var(--foreground)", fontFamily: "var(--font-mono-face)" }}>
                {qty}
              </span>
              <button
                onClick={() => onQtyChange(1)}
                className="w-7 h-7 flex items-center justify-center text-sm hover:opacity-60 transition-opacity"
                style={{ color: "var(--foreground)" }}
              >
                +
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={onAdd}
              className="h-7 px-3 rounded-lg text-xs font-semibold transition-all duration-300 active:scale-95"
              style={{
                background: isAdded ? "#3d9e65" : "var(--primary)",
                color: isAdded ? "#fff" : "var(--primary-foreground)",
                fontFamily: "var(--font-sans)",
                minWidth: 76,
                boxShadow: isAdded ? "none" : "0 2px 8px rgba(232,132,90,0.25)",
              }}
            >
              {isAdded ? "✓ Ajouté" : "Ajouter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
