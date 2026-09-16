import { useState } from "react";
import logoUrl from "../assets/logo.svg";

// Props attendues par la page d'authentification :
// - onLogin est appelé par le composant parent (App) une fois le formulaire validé.
interface Props {
  onLogin: () => void;
}

// Photo d'ambiance affichée sur le panneau gauche (visible uniquement sur grand écran).
const HERO_IMG = "https://images.unsplash.com/photo-1469234496837-d0101f54be3e?w=900&h=1200&fit=crop&auto=format";

// Logo "Resto Web" (fichier vectoriel fourni, importé depuis src/assets/logo.svg).
// `size` contrôle la largeur affichée en pixels ; la hauteur suit le ratio d'origine du fichier.
function Logo({ size = 56 }: { size?: number }) {
  return <img src={logoUrl} alt="Logo Resto Web" style={{ width: size, height: "auto" }} />;
}

export default function AuthPage({ onLogin }: Props) {
  // Onglet actif du formulaire : connexion ou inscription.
  const [mode, setMode] = useState<"login" | "register">("login");
  // Valeurs saisies dans les différents champs du formulaire.
  const [form, setForm] = useState({ login: "", email: "", password: "", confirm: "" });
  // Message d'erreur affiché en cas de validation échouée.
  const [error, setError] = useState("");

  // Validation basique côté client avant de déclencher la connexion (aucun appel serveur ici).
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
      {/* Panneau gauche : photo d'ambiance, visible uniquement à partir du breakpoint lg */}
      <div className="hidden lg:block w-[52%] relative overflow-hidden">
        <img
          src={HERO_IMG}
          alt="Ambiance Bistro Moderne, verres de vin sur table en bois"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.55)" }}
        />
        {/* Dégradé sombre pour assurer la lisibilité du texte au-dessus de la photo */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(26,19,16,0) 60%, #1a1310 100%)" }}
        />
        {/* Contenu superposé à la photo : logo en haut, accroche centrée à gauche */}
        <div className="relative h-full p-12">
          <Logo size={56} />
          <div className="absolute inset-0 flex flex-col justify-center items-start p-12">
            <p
              className="text-7xl leading-[1.15] mb-6 text-white text-left"
              style={{ fontFamily: "var(--font-serif)", textShadow: "0 2px 24px rgba(0,0,0,0.5)" }}
            >
              Commandez,<br />
              <em style={{ color: "var(--accent)" }}>savourez</em>,<br />
              répétez.
            </p>
            <p className="text-base leading-relaxed max-w-xs text-left" style={{ color: "rgba(255,255,255,0.65)" }}>
              Cuisine de saison, produits locaux. Votre expérience culinaire commence ici.
            </p>
          </div>
        </div>
      </div>

      {/* Panneau droit : formulaire de connexion / inscription */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-14" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-md">
          {/* Logo affiché uniquement sur mobile/tablette (le panneau photo gauche est masqué en dessous de lg) */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size={72} />
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

          {/* Onglets de bascule entre connexion et inscription */}
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

// Champ de formulaire réutilisable (label + input stylisé) pour les écrans de connexion/inscription.
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
