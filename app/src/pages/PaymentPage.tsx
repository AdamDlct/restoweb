import { useState } from "react";
import { CartItem, OrderMode } from "../types";

interface Props {
  cart: CartItem[];
  orderMode: OrderMode;
  onBack: () => void;
  onConfirm: () => void;
}

// Mêmes taux de TVA que dans CartPage (dupliqué faute de fichier de constantes partagé).
const TVA_RATES: Record<OrderMode, number> = { emporter: 0.055, surplace: 0.10 };

export default function PaymentPage({ cart, orderMode, onBack, onConfirm }: Props) {
  const [form, setForm] = useState({ card: "", cvc: "", expiry: "" });
  const [error, setError] = useState("");
  // Affiche un état "traitement en cours" pendant la simulation de paiement (aucun vrai appel réseau).
  const [loading, setLoading] = useState(false);

  const totalHT = cart.reduce((s, c) => s + c.priceHT * c.qty, 0);
  const tvaRate = TVA_RATES[orderMode];
  const totalTTC = totalHT * (1 + tvaRate);

  // Formate la saisie du numéro de carte en groupes de 4 chiffres (ex: "1234 5678 9012 3456").
  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  // Formate la date d'expiration au format MM/AA au fil de la saisie.
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  // Valide les champs puis simule un traitement de paiement (délai artificiel de 1,8s) avant de continuer.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.card.replace(/\s/g, "").length < 16) { setError("Numéro de carte invalide."); return; }
    if (form.cvc.length < 3) { setError("CVC invalide."); return; }
    if (form.expiry.length < 5) { setError("Date d'expiration invalide."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); }, 1800);
  };

  // Numéro affiché sur la carte bancaire animée (masqué tant que rien n'est saisi).
  const cardDisplay = form.card || "•••• •••• •••• ••••";

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
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
          Retour au panier
        </button>
        <div>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--accent)", fontSize: "1.15rem" }}>Bistro</span>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)", fontSize: "1.15rem" }}> Moderne</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_360px] gap-10">
        {/* Left: form */}
        <div>
          <h1 className="text-4xl mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}>
            <em style={{ color: "var(--accent)" }}>Paiement</em>
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
            Finalisez votre commande en renseignant vos coordonnées.
          </p>

          {/* Fictitious notice */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-8 text-xs"
            style={{ background: "rgba(240,169,107,0.07)", border: "1px solid rgba(240,169,107,0.22)", color: "var(--muted-foreground)" }}
          >
            <span className="text-base flex-shrink-0">🔒</span>
            <span>
              <strong style={{ color: "var(--accent)" }}>Paiement fictif</strong> — aucune transaction réelle. Ne saisissez pas vos vraies coordonnées bancaires.
            </span>
          </div>

          {/* Animated card widget */}
          <div
            className="relative rounded-2xl p-7 mb-8 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #2c1507 0%, #6b3520 45%, #e8845a 100%)",
              minHeight: 170,
              fontFamily: "var(--font-mono-face)",
              boxShadow: "0 12px 48px rgba(232,132,90,0.25)",
            }}
          >
            {/* Decorative circles */}
            <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full opacity-10" style={{ background: "#fff" }} />
            <div className="absolute bottom-[-30px] right-[60px] w-32 h-32 rounded-full opacity-8" style={{ background: "#fff" }} />

            <div className="relative">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs tracking-widest uppercase text-white opacity-60">Bistro Carte</p>
                <svg width="40" height="26" viewBox="0 0 40 26" fill="none" className="opacity-70">
                  <circle cx="15" cy="13" r="13" fill="rgba(255,255,255,0.4)" />
                  <circle cx="25" cy="13" r="13" fill="rgba(255,255,255,0.25)" />
                </svg>
              </div>
              <p className="text-xl tracking-[0.2em] text-white mb-6 font-medium" style={{ letterSpacing: "0.15em" }}>
                {cardDisplay}
              </p>
              <div className="flex justify-between text-xs text-white opacity-75">
                <div>
                  <p className="opacity-60 mb-0.5 text-[10px] uppercase tracking-wider">Expiration</p>
                  <p>{form.expiry || "MM/AA"}</p>
                </div>
                <div className="text-right">
                  <p className="opacity-60 mb-0.5 text-[10px] uppercase tracking-wider">CVC</p>
                  <p>{form.cvc ? "•".repeat(form.cvc.length) : "•••"}</p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PayField
              label="Numéro de carte"
              value={form.card}
              onChange={(v) => setForm({ ...form, card: formatCard(v) })}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              inputMode="numeric"
            />
            <div className="grid grid-cols-2 gap-4">
              <PayField
                label="Date d'expiration"
                value={form.expiry}
                onChange={(v) => setForm({ ...form, expiry: formatExpiry(v) })}
                placeholder="MM/AA"
                maxLength={5}
                inputMode="numeric"
              />
              <PayField
                label="CVC"
                value={form.cvc}
                onChange={(v) => setForm({ ...form, cvc: v.replace(/\D/g, "").slice(0, 4) })}
                placeholder="123"
                maxLength={4}
                inputMode="numeric"
              />
            </div>

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#ff8a8a", background: "rgba(255,100,100,0.08)", border: "1px solid rgba(255,100,100,0.18)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold tracking-wide transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 text-base"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-sans)", boxShadow: "0 6px 28px rgba(232,132,90,0.35)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Traitement en cours…
                </span>
              ) : (
                `Payer ${totalTTC.toFixed(2)} € TTC`
              )}
            </button>
          </form>
        </div>

        {/* Right: summary */}
        <div className="h-fit sticky top-24">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <div className="px-6 py-4" style={{ background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                Récapitulatif
              </h2>
            </div>
            <div className="px-6 py-5" style={{ background: "var(--card)" }}>
              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--foreground)" }}>
                      {item.name}
                      <span className="ml-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>× {item.qty}</span>
                    </span>
                    <span style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-mono-face)" }}>
                      {(item.priceHT * item.qty).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <SRow label="Total HT" value={`${totalHT.toFixed(2)} €`} />
                <SRow label={`TVA ${orderMode === "surplace" ? "10 %" : "5,5 %"}`} value={`${(totalHT * tvaRate).toFixed(2)} €`} muted />
                <div className="pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <SRow label="Total TTC" value={`${totalTTC.toFixed(2)} €`} large accent />
                </div>
              </div>

              <div className="mt-4 pt-4 flex items-center gap-2 text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                {orderMode === "surplace" ? "🍽️ Sur place" : "🥡 À emporter"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Champ de saisie stylisé pour les informations de carte bancaire (numéro, expiration, CVC).
function PayField({ label, value, onChange, placeholder, maxLength, inputMode }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 tracking-widest uppercase" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-150"
        style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)", fontFamily: "var(--font-mono-face)", letterSpacing: "0.05em" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

// Ligne clé/valeur du récapitulatif de commande (panneau de droite).
function SRow({ label, value, muted, large, accent }: { label: string; value: string; muted?: boolean; large?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: muted ? "var(--muted-foreground)" : "var(--foreground)", fontFamily: "var(--font-sans)" }}>{label}</span>
      <span className={large ? "text-xl font-bold" : "text-sm"} style={{ color: accent ? "var(--accent)" : muted ? "var(--muted-foreground)" : "var(--foreground)", fontFamily: "var(--font-mono-face)" }}>
        {value}
      </span>
    </div>
  );
}
