import { CartItem, OrderMode } from "../types";

interface Props {
  cart: CartItem[];
  orderMode: OrderMode;
  setOrderMode: (m: OrderMode) => void;
  updateQty: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  onBack: () => void;
  onPay: () => void;
}

const TVA_RATES: Record<OrderMode, number> = { emporter: 0.055, surplace: 0.10 };

export default function CartPage({ cart, orderMode, setOrderMode, updateQty, removeItem, onBack, onPay }: Props) {
  const totalHT = cart.reduce((s, c) => s + c.priceHT * c.qty, 0);
  const tvaRate = TVA_RATES[orderMode];
  const tva = totalHT * tvaRate;
  const totalTTC = totalHT + tva;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 border-b"
        style={{ background: "rgba(26,19,16,0.92)", borderColor: "var(--border)", backdropFilter: "blur(16px)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-opacity hover:opacity-60"
          style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Retour à la carte
        </button>
        <div>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--accent)", fontSize: "1.15rem" }}>Bistro</span>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)", fontSize: "1.15rem" }}> Moderne</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-baseline gap-4 mb-1">
          <h1 className="text-4xl" style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}>
            Mon <em style={{ color: "var(--accent)" }}>panier</em>
          </h1>
          {cart.length > 0 && (
            <span className="text-sm" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono-face)" }}>
              {cart.reduce((s, c) => s + c.qty, 0)} article{cart.reduce((s, c) => s + c.qty, 0) > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="text-sm mb-10" style={{ color: "var(--muted-foreground)" }}>
          Vérifiez votre commande avant de passer au paiement.
        </p>

        {cart.length === 0 ? (
          <div className="text-center py-24 rounded-2xl" style={{ border: "1px dashed var(--border)" }}>
            <p className="text-5xl mb-4">🛒</p>
            <p className="font-medium mb-1" style={{ color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>Votre panier est vide</p>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>Explorez notre carte et choisissez vos plats.</p>
            <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-80" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
              Voir la carte
            </button>
          </div>
        ) : (
          <>
            {/* Line items */}
            <div className="rounded-2xl overflow-hidden mb-5" style={{ border: "1px solid var(--border)" }}>
              {/* Header row */}
              <div
                className="grid text-xs font-medium uppercase tracking-wider px-5 py-3"
                style={{ gridTemplateColumns: "1fr 120px 90px 90px 36px", background: "var(--secondary)", color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}
              >
                <span>Produit</span>
                <span className="text-center">Quantité</span>
                <span className="text-right">PU HT</span>
                <span className="text-right">Total HT</span>
                <span />
              </div>

              {cart.map((item, i) => (
                <div
                  key={item.id}
                  className="grid items-center px-5 py-4 transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 120px 90px 90px 36px",
                    borderBottom: i < cart.length - 1 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "var(--card)" : "var(--background)",
                  }}
                >
                  <span className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{item.name}</span>

                  <div className="flex items-center justify-center">
                    <div className="flex items-center rounded-lg overflow-hidden" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center hover:opacity-60 transition-opacity" style={{ color: "var(--foreground)" }}>−</button>
                      <span className="w-7 text-center text-sm" style={{ color: "var(--foreground)", fontFamily: "var(--font-mono-face)" }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center hover:opacity-60 transition-opacity" style={{ color: "var(--foreground)" }}>+</button>
                    </div>
                  </div>

                  <span className="text-right text-sm" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono-face)" }}>
                    {item.priceHT.toFixed(2)} €
                  </span>
                  <span className="text-right font-semibold text-sm" style={{ color: "var(--accent)", fontFamily: "var(--font-mono-face)" }}>
                    {(item.priceHT * item.qty).toFixed(2)} €
                  </span>
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all hover:scale-110"
                      style={{ background: "rgba(255,100,100,0.12)", color: "#ff8a8a" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mode de consommation */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold mb-4 uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                <span>Mode de consommation</span>
                <span style={{ color: "var(--primary)" }}>*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: "surplace", label: "Sur place", emoji: "🍽️", sub: "TVA 10 %", desc: "Servi à votre table" },
                  { value: "emporter", label: "À emporter", emoji: "🥡", sub: "TVA 5,5 %", desc: "Prêt au comptoir" },
                ] as const).map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      border: `2px solid ${orderMode === opt.value ? "var(--primary)" : "var(--border)"}`,
                      background: orderMode === opt.value ? "rgba(232,132,90,0.07)" : "var(--secondary)",
                      boxShadow: orderMode === opt.value ? "0 2px 16px rgba(232,132,90,0.15)" : "none",
                    }}
                  >
                    <input type="radio" name="mode" value={opt.value} checked={orderMode === opt.value} onChange={() => setOrderMode(opt.value)} className="sr-only" />
                    <span className="text-2xl mt-0.5">{opt.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{opt.desc}</p>
                      <p className="text-xs mt-1 font-medium" style={{ color: "var(--accent)", fontFamily: "var(--font-mono-face)" }}>{opt.sub}</p>
                    </div>
                    {orderMode === opt.value && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Totaux */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="space-y-3">
                <TRow label="Total HT" value={`${totalHT.toFixed(2)} €`} />
                <TRow label={`TVA ${orderMode === "surplace" ? "10 %" : "5,5 %"} · ${orderMode === "surplace" ? "sur place" : "à emporter"}`} value={`+ ${tva.toFixed(2)} €`} muted />
                <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <TRow label="Total TTC" value={`${totalTTC.toFixed(2)} €`} large accent />
                </div>
              </div>
            </div>

            <button
              onClick={onPay}
              className="w-full py-4 rounded-xl font-semibold tracking-wide transition-all hover:opacity-90 active:scale-[0.98] text-base"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-sans)", boxShadow: "0 6px 28px rgba(232,132,90,0.35)" }}
            >
              Procéder au paiement →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function TRow({ label, value, muted, large, accent }: { label: string; value: string; muted?: boolean; large?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={large ? "font-semibold" : "text-sm"} style={{ color: muted ? "var(--muted-foreground)" : "var(--foreground)", fontFamily: "var(--font-sans)" }}>
        {label}
      </span>
      <span
        className={large ? "text-2xl font-bold" : "text-sm"}
        style={{ color: accent ? "var(--accent)" : muted ? "var(--muted-foreground)" : "var(--foreground)", fontFamily: "var(--font-mono-face)" }}
      >
        {value}
      </span>
    </div>
  );
}
