import { useState } from "react";

interface Props {
  onLogin: () => void;
}

const HERO_IMG = "https://images.unsplash.com/photo-1469234496837-d0101f54be3e?w=900&h=1200&fit=crop&auto=format";

export default function AuthPage({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ login: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      if (!form.login || !form.email || !form.password || !form.confirm) { setError("Veuillez remplir tous les champs."); return; }
      if (form.password !== form.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    } else {
      if (!form.login || !form.password) { setError("Identifiant et mot de passe requis."); return; }
    }
    setError("");
    onLogin();
  };

  return (
    <div className="min-h-screen flex">
      {/* Photo panel */}
      <div className="hidden lg:block w-[52%] relative overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Ambiance Bistro Moderne, verres de vin sur table en bois"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.55)" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(26,19,16,0) 60%, #1a1310 100%)" }}
        />
        {/* Content on photo */}
        <div className="relative h-full flex flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <span
              className="text-2xl tracking-widest"
              style={{ fontFamily: "var(--font-serif)", color: "var(--accent)" }}
            >
              Bistro
            </span>
            <span
              className="text-2xl"
              style={{ fontFamily: "var(--font-serif)", color: "#fff" }}
            >
              Moderne
            </span>
          </div>
          <div>
            <p
              className="text-5xl leading-[1.15] mb-5 text-white"
              style={{ fontFamily: "var(--font-serif)", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
            >
              Commandez,<br />
              <em style={{ color: "var(--accent)" }}>savourez</em>,<br />
              répétez.
            </p>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
              Cuisine de saison, produits locaux. Votre expérience culinaire commence ici.
            </p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-14" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8 text-center">
            <span style={{ fontFamily: "var(--font-serif)", color: "var(--accent)", fontSize: "1.6rem" }}>Bistro </span>
            <span style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)", fontSize: "1.6rem" }}>Moderne</span>
          </div>

          <h2
            className="text-3xl mb-1"
            style={{ fontFamily: "var(--font-serif)", color: "var(--foreground)" }}
          >
            {mode === "login" ? "Bon retour" : <><em style={{ color: "var(--accent)" }}>Créer</em> un compte</>}
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
            {mode === "login"
              ? "Connectez-vous pour accéder à la carte."
              : "Rejoignez-nous et commandez en quelques secondes."}
          </p>

          {/* Tabs */}
          <div className="flex gap-0 mb-8" style={{ borderBottom: "1px solid var(--border)" }}>
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="px-1 pb-3 mr-6 text-sm font-medium transition-all duration-200 relative"
                style={{
                  color: mode === m ? "var(--foreground)" : "var(--muted-foreground)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {m === "login" ? "Connexion" : "Inscription"}
                {mode === m && (
                  <span
                    className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full"
                    style={{ background: "var(--primary)" }}
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {mode === "register" && (
              <Field label="Login" type="text" value={form.login} onChange={(v) => setForm({ ...form, login: v })} placeholder="votre_pseudo" />
            )}
            <Field
              label={mode === "login" ? "Login ou Email" : "Email"}
              type={mode === "login" ? "text" : "email"}
              value={mode === "login" ? form.login : form.email}
              onChange={(v) => setForm(mode === "login" ? { ...form, login: v } : { ...form, email: v })}
              placeholder={mode === "login" ? "pseudo ou email@..." : "email@exemple.fr"}
            />
            <Field label="Mot de passe" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••••••" />
            {mode === "register" && (
              <Field label="Confirmation du mot de passe" type="password" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} placeholder="••••••••" />
            )}

            {error && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#ff8a8a", background: "rgba(255,100,100,0.08)", border: "1px solid rgba(255,100,100,0.18)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] mt-2"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontFamily: "var(--font-sans)", boxShadow: "0 4px 20px rgba(232,132,90,0.3)" }}
            >
              {mode === "login" ? "Se connecter →" : "Créer mon compte →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }: {
  label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5 tracking-wider uppercase" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-150"
        style={{ background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)", fontFamily: "var(--font-sans)" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
