import { useState, useEffect } from "react";
import { OrderMode } from "../types";

interface Props {
  orderId: number;
  orderMode: OrderMode;
}

type OrderState = "attente" | "preparation" | "prete" | "servie";

const STATES: { key: OrderState; label: string; emoji: string; color: string; duration: number }[] = [
  { key: "attente", label: "En attente", emoji: "⏳", color: "#9e8878", duration: 4000 },
  { key: "preparation", label: "En préparation", emoji: "👨‍🍳", color: "#e8c27a", duration: 6000 },
  { key: "prete", label: "Prête !", emoji: "🔔", color: "#e8845a", duration: 5000 },
  { key: "servie", label: "Servie", emoji: "✅", color: "#4caf76", duration: 0 },
];

const FOOD_IMG = "https://images.unsplash.com/photo-1675670601305-3e04ec45430f?w=600&h=400&fit=crop&auto=format";

export default function TrackingPage({ orderId, orderMode }: Props) {
  const [stateIdx, setStateIdx] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (stateIdx >= STATES.length - 1) return;
    const t = setTimeout(() => setStateIdx((i) => i + 1), STATES[stateIdx].duration);
    return () => clearTimeout(t);
  }, [stateIdx]);

  useEffect(() => {
    if (STATES[stateIdx].key === "prete") {
      setTimeout(() => setShowNotif(true), 400);
    }
  }, [stateIdx]);

  const current = STATES[stateIdx];
  const progressPct = ((stateIdx) / (STATES.length - 1)) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <header className="flex items-center justify-between px-6 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
        <div>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--accent)", fontSize: "1.2rem" }}>Bistro</span>
          <span style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)", fontSize: "1.2rem" }}> Moderne</span>
        </div>
        <span className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--secondary)", color: "var(--muted-foreground)", fontFamily: "var(--font-mono-face)", border: "1px solid var(--border)" }}>
          #{orderId}
        </span>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 px-6 py-12 max-w-5xl mx-auto w-full">

        {/* Left: status */}
        <div className="flex-1 w-full max-w-lg">
          {/* Big status display */}
          <div
            className="rounded-3xl p-8 mb-6 text-center relative overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 4px 32px rgba(0,0,0,0.25)" }}
          >
            {/* Glow behind emoji */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity: 0.06 }}
            >
              <div className="w-64 h-64 rounded-full" style={{ background: current.color, filter: "blur(60px)" }} />
            </div>

            <div className="relative">
              <span className="text-7xl block mb-5" style={{ filter: `drop-shadow(0 0 24px ${current.color}66)` }}>
                {current.emoji}
              </span>
              <h1 className="text-3xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}>
                {current.key === "prete"
                  ? <>Commande <em style={{ color: "var(--accent)" }}>prête !</em></>
                  : current.key === "servie"
                  ? <>Bon <em style={{ color: "#4caf76" }}>appétit !</em></>
                  : <em style={{ color: "var(--accent)" }}>{current.label}</em>}
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {current.key === "attente" && "Votre commande a été reçue et est en file d'attente."}
                {current.key === "preparation" && "Nos cuisiniers préparent votre repas avec soin."}
                {current.key === "prete" && (orderMode === "surplace" ? "Votre plat arrive à votre table dans un instant." : "Venez récupérer votre commande au comptoir !")}
                {current.key === "servie" && "Merci pour votre visite. À très bientôt !"}
              </p>
            </div>
          </div>

          {/* Notification */}
          {showNotif && current.key === "prete" && (
            <div
              className="flex items-center gap-3 px-5 py-3.5 rounded-xl mb-5 text-sm"
              style={{
                background: "rgba(232,132,90,0.1)",
                border: "1px solid rgba(232,132,90,0.35)",
                color: "var(--accent)",
                fontFamily: "var(--font-sans)",
                animation: "pulse 2s infinite",
              }}
            >
              <span className="text-xl">🔔</span>
              <span className="font-semibold">
                {orderMode === "surplace" ? "Votre plat arrive !" : "Prêt à être récupéré au comptoir !"}
              </span>
            </div>
          )}

          {/* Progress */}
          <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {/* Bar */}
            <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: "var(--secondary)" }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, var(--primary), ${current.color})` }}
              />
            </div>

            {/* Steps */}
            <div className="flex justify-between">
              {STATES.map((s, i) => {
                const done = i < stateIdx;
                const active = i === stateIdx;
                return (
                  <div key={s.key} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all duration-300"
                      style={{
                        background: done ? s.color : active ? "rgba(232,132,90,0.15)" : "var(--secondary)",
                        border: active ? `2px solid ${s.color}` : done ? `2px solid ${s.color}` : "2px solid var(--border)",
                        boxShadow: active ? `0 0 16px ${s.color}44` : "none",
                        color: done || active ? (done ? "#fff" : s.color) : "var(--muted-foreground)",
                      }}
                    >
                      {done ? "✓" : s.emoji}
                    </div>
                    <span
                      className="text-xs text-center leading-tight"
                      style={{
                        color: active ? "var(--foreground)" : done ? "var(--muted-foreground)" : "var(--muted-foreground)",
                        fontFamily: "var(--font-sans)",
                        fontWeight: active ? 600 : 400,
                        opacity: done ? 0.6 : 1,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {current.key === "servie" && (
            <button
              onClick={() => window.location.reload()}
              className="w-full mt-5 py-3.5 rounded-xl font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-sans)", boxShadow: "0 6px 24px rgba(232,132,90,0.3)" }}
            >
              Nouvelle commande
            </button>
          )}
        </div>

        {/* Right: info + food photo */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          {/* Order details */}
          <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--muted-foreground)" }}>
              Détails
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Commande</p>
                <p className="font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-mono-face)" }}>#{orderId}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Mode</p>
                <p style={{ color: "var(--foreground)" }}>{orderMode === "surplace" ? "🍽️ Sur place" : "🥡 À emporter"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>Statut</p>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: `${current.color}18`, color: current.color, border: `1px solid ${current.color}40` }}
                >
                  {current.emoji} {current.label}
                </span>
              </div>
              <div className="col-span-2">
                <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Temps estimé</p>
                <p style={{ color: "var(--foreground)", fontFamily: "var(--font-mono-face)", fontSize: "0.875rem" }}>
                  {current.key === "attente" ? "~15 min" : current.key === "preparation" ? "~8 min" : current.key === "prete" ? "Maintenant" : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Food photo */}
          <div className="rounded-2xl overflow-hidden relative" style={{ height: 200, background: "var(--secondary)" }}>
            <img
              src={FOOD_IMG}
              alt="Plat gastronomique Bistro Moderne"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.7)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(26,19,16,0.8) 0%, transparent 50%)" }}
            />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans)" }}>
                Cuisine de saison · Produits locaux
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
