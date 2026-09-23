// ============================================================================
// app.js — tout le comportement du site (une seule page HTML, pas de framework)
// ============================================================================
// Grands principes utilisés dans ce fichier :
//  1. SPA maison : une seule fonction goTo(page) montre/cache les sections.
//  2. État global : quelques variables (cart, orderMode...) représentent
//     "ce qui se passe" dans l'appli. Chaque action (clic, saisie) modifie
//     cet état PUIS relance une fonction "render..." qui remet à jour le HTML.
//     → Modifier l'état sans re-render ne change rien à l'écran.
//     → Toujours re-render après avoir modifié l'état.
//  3. Pas de framework (React, Vue...) : on manipule le DOM "à la main" avec
//     document.getElementById / querySelector / addEventListener.
//  4. Sécurité : jamais de innerHTML avec du texte dynamique (risque de faille
//     XSS si une donnée contenait du HTML). On construit les éléments avec
//     document.createElement() et on insère le texte avec .textContent
//     (voir les petites fonctions utilitaires h() et append() ci-dessous).
// ============================================================================


// ============================================================================
// SECTION 1 — Fonctions utilitaires DOM (génériques, utilisées partout)
// ============================================================================

// Crée un élément HTML : h("button", "ma-classe", "Texte du bouton")
function h(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text; // .textContent = texte brut, jamais interprété comme du HTML
  return node;
}

// Ajoute plusieurs enfants à un parent en une seule fois, puis renvoie le parent
// (permet d'enchaîner : append(h("div"), enfant1, enfant2))
function append(parent, ...children) {
  children.forEach((c) => c && parent.appendChild(c));
  return parent;
}

// Composant réutilisable : le petit stepper [ − 1 + ] de quantité.
// Utilisé à deux endroits différents (carte produit du catalogue ET ligne du
// panier) → on l'écrit une seule fois ici plutôt que de dupliquer le code.
function qtyStepper(qty, onDec, onInc) {
  const label = h("span", null, String(qty));
  const dec = h("button", null, "−");
  const inc = h("button", null, "+");
  dec.type = inc.type = "button"; // évite qu'un bouton dans un <form> déclenche un submit
  dec.addEventListener("click", onDec);
  inc.addEventListener("click", onInc);
  return append(h("div", "qty-stepper"), dec, label, inc);
}


// ============================================================================
// SECTION 2 — État global de l'application
// ============================================================================
// Ces variables décrivent l'état courant du "faux backend" côté client.
// Elles sont lues et modifiées par plusieurs pages (catalogue, panier, paiement).

let cart = [];                       // Panier : une entrée par unité ajoutée
let orderMode = "surplace";          // "surplace" ou "emporter" → change le taux de TVA
// let orderId = Math.floor(Math.random() * 9000) + 1000; // Numéro de commande, généré une seule fois au chargement
const TVA_RATES = { emporter: 0.055, surplace: 0.10 };    // Taux de TVA français
const PAGE_URLS = {
  auth: "index.php",
  catalog: "catalogue.php",
  cart: "panier.php",
  payment: "paiement.php",
  tracking: "suivi-commande.php",
};

function loadState() {
  try {
    cart = JSON.parse(localStorage.getItem("restoweb_cart")) || [];
    // Conversion des anciens paniers : une quantité de 3 devient 3 lignes séparées.
    cart = cart.flatMap((item) => {
      const qty = Math.max(1, Number(item.qty) || 1);
      return Array.from({ length: qty }, (_, index) => ({
        ...item,
        qty: 1,
        lineId: item.lineId || `${item.id}-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
      }));
    });
    orderMode = localStorage.getItem("restoweb_order_mode") || "surplace";
    orderId = Number(localStorage.getItem("restoweb_order_id")) || orderId;
  } catch (error) {
    cart = [];
    orderMode = "surplace";
  }
}

function saveState() {
  localStorage.setItem("restoweb_cart", JSON.stringify(cart));
  localStorage.setItem("restoweb_order_mode", orderMode);
  localStorage.setItem("restoweb_order_id", String(orderId));
}

loadState();


// ============================================================================
// SECTION 3 — Navigation entre les "pages" (SPA sans routeur)
// ============================================================================
// Principe : chaque page est un <div class="page" id="page-xxx"> dans le HTML.
// goTo("xxx") retire la classe "active" à toutes les pages puis l'ajoute
// uniquement à la page ciblée (voir css/style.css → ".page" / ".page.active").
// C'est TOUTE la "navigation" du site : pas de changement d'URL, pas de rechargement.

function goTo(page) {
  saveState();
  window.location.href = PAGE_URLS[page] || PAGE_URLS.auth;
}

// Délégation générique : tout élément avec l'attribut data-nav="xxx" devient
// un bouton de navigation vers la page "xxx", sans avoir à écrire un
// addEventListener séparé pour chaque bouton "retour" du site.
document.querySelectorAll("[data-nav]").forEach((elt) => elt.addEventListener("click", () => goTo(elt.dataset.nav)));


// ============================================================================
// SECTION 4 — Panier : opérations sur les données (indépendantes de l'affichage)
// ============================================================================
// Ces fonctions ne touchent QUE le tableau `cart`. L'affichage est mis à jour
// séparément (updateCartBadges / renderCart), ce qui sépare bien "les données"
// du "rendu visuel".

function addToCart(item) {
  // Chaque unité est une ligne distincte, même lorsqu'il s'agit du même plat.
  Array.from({ length: item.qty }, (_, index) => {
    cart.push({
      ...item,
      qty: 1,
      lineId: `${item.id}-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
    });
  });
  saveState();
  updateCartBadges();
}

function updateQty(lineId, qty) {
  if (qty <= 0) cart = cart.filter((c) => c.lineId !== lineId);
  else {
    const item = cart.find((c) => c.lineId === lineId);
    if (item) item.qty = qty;
  }
  saveState();
  updateCartBadges();
  renderCart();
}

function removeItem(lineId) {
  cart = cart.filter((c) => c.lineId !== lineId);
  saveState();
  updateCartBadges();
  renderCart();
}

// Petites fonctions "calculées" à partir de l'état du panier (jamais stockées, toujours recalculées)
const totalItems = () => cart.reduce((s, c) => s + c.qty, 0);
const totalHT = () => cart.reduce((s, c) => s + c.priceHT * c.qty, 0);

// Met à jour le badge du panier dans le header du catalogue ET la barre flottante en bas d'écran.
// Appelée après CHAQUE modification du panier, où que l'on soit sur le site.
function updateCartBadges() {
  if (!document.getElementById("catalog-cart-btn")) return;
  const items = totalItems();
  const total = totalHT();

  document.getElementById("catalog-cart-btn").classList.toggle("has-items", items > 0);
  document.getElementById("catalog-cart-badge").style.display = items > 0 ? "flex" : "none";
  document.getElementById("catalog-cart-badge").textContent = items;
  document.getElementById("catalog-cart-label").textContent = items > 0 ? total.toFixed(2) + " € HT" : "Panier";

  document.getElementById("floating-cart").classList.toggle("visible", items > 0);
  document.getElementById("floating-cart-badge").textContent = items;
  document.getElementById("floating-cart-total").textContent = total.toFixed(2) + " €";
}

if (document.getElementById("catalog-cart-btn")) {
  document.getElementById("catalog-cart-btn").addEventListener("click", () => goTo("cart"));
}
if (document.getElementById("floating-cart-btn")) {
  document.getElementById("floating-cart-btn").addEventListener("click", () => goTo("cart"));
}


// ============================================================================
// SECTION 5 — Page Auth (connexion / inscription)
// ============================================================================

let authMode = "login"; // "login" ou "register" : détermine quels champs afficher

// Clic sur un onglet "Connexion" / "Inscription" → on adapte le formulaire
// (champs visibles, textes, placeholders) SANS recharger la page.
document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    authMode = tab.dataset.mode;
    const isRegister = authMode === "register";
    const authModeInput = document.getElementById("auth-mode");
    if (authModeInput) authModeInput.value = authMode;

    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.toggle("active", t === tab));
    document.getElementById("field-login-register").classList.toggle("hidden-field", !isRegister);
    document.getElementById("field-confirm").classList.toggle("hidden-field", !isRegister);
    document.getElementById("field-main-label").textContent = isRegister ? "Email" : "Login ou Email";
    document.getElementById("main-id").placeholder = isRegister ? "email@exemple.fr" : "pseudo ou email@...";
    document.getElementById("main-id").type = isRegister ? "email" : "text";

    const title = document.getElementById("auth-title");
    title.textContent = "";
    if (isRegister) append(title, h("em", null, "Créer"), document.createTextNode(" un compte"));
    else title.textContent = "Bon retour";

    document.getElementById("auth-subtitle").textContent = isRegister
      ? "Rejoignez-nous et commandez en quelques secondes."
      : "Connectez-vous pour accéder à la carte.";
    document.getElementById("auth-submit").textContent = isRegister ? "Créer mon compte →" : "Se connecter →";
    document.getElementById("auth-error").style.display = "none";
  });
});

// Soumission du formulaire : validation simple côté client uniquement
// (aucun vrai compte n'est créé, il n'y a pas de serveur derrière ce site).
if (document.getElementById("auth-form")) {
  document.getElementById("auth-form").addEventListener("submit", (e) => {
  const form = e.currentTarget;
  const errorEl = document.getElementById("auth-error");
  const login = document.getElementById("reg-login").value;
  const mainId = document.getElementById("main-id").value;
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;
  const authModeInput = document.getElementById("auth-mode");
  if (authModeInput) authModeInput.value = authMode;

  let error = "";
  if (authMode === "register") {
    if (!login || !mainId || !password || !confirm) error = "Veuillez remplir tous les champs.";
    else if (password !== confirm) error = "Les mots de passe ne correspondent pas.";
  } else if (!mainId || !password) {
    error = "Identifiant et mot de passe requis.";
  }

  if (error) {
    e.preventDefault();
    errorEl.textContent = error;
    errorEl.style.display = "block";
    return; // on arrête ici : pas de navigation tant que le formulaire est invalide
  }
  errorEl.style.display = "none";
  if (form.method.toLowerCase() !== "post") {
    e.preventDefault();
    goTo("catalog");
  }
  });
}


// ============================================================================
// SECTION 6 — Page Catalogue (liste des produits + filtres)
// ============================================================================
// Principe : le HTML contient des conteneurs vides (#category-filters,
// #product-grid). Ici on les remplit dynamiquement à partir de PRODUCTS et
// CATEGORIES (déclarés dans data.js), puis on les régénère à chaque clic
// sur un filtre de catégorie.

let activeCategory = "Tous";        // catégorie actuellement sélectionnée
const productQtys = {};             // quantité choisie par produit AVANT ajout au panier, ex: {3: 2}
const addedTimers = {};             // un setTimeout par produit, pour le petit "✓ Ajouté" temporaire
const getQty = (id) => productQtys[id] ?? 1; // 1 par défaut si jamais modifié

function renderCategoryFilters() {
  const container = document.getElementById("category-filters");
  if (!container) return;
  container.textContent = ""; // on vide avant de re-générer (évite les doublons)
  ["Tous", ...CATEGORIES].forEach((cat) => {
    const btn = h("button", "category-chip" + (cat === activeCategory ? " active" : ""), cat);
    btn.type = "button";
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderCategoryFilters(); // on re-dessine les filtres (pour déplacer le style "active")
      renderProductGrid();     // ... et la grille filtrée
    });
    container.appendChild(btn);
  });
}

// Construit UNE carte produit (photo, nom, description, prix, stepper, bouton "Ajouter").
function buildProductCard(product) {
  const img = h("img", "product-card-img");
  img.src = product.imageUrl;
  img.alt = product.name;
  img.style.opacity = "0"; // masqué tant que l'image n'a pas fini de charger
  const emojiFallback = h("div", "product-card-emoji", product.emoji);
  img.addEventListener("load", () => {
    img.style.opacity = "1";
    emojiFallback.style.display = "none"; // l'emoji de secours disparaît une fois la vraie photo chargée
  });

  const photo = append(h("div", "product-card-photo"),
    img, emojiFallback, h("div", "product-card-fade"), h("span", "product-card-badge", product.category));

  const priceBlock = append(h("div", "product-card-price"),
    h("span", "amount", product.priceHT.toFixed(2)), h("span", "unit", "€ HT"));

  // Stepper de quantité (avant ajout au panier) : met à jour productQtys puis le texte affiché.
  const stepper = qtyStepper(getQty(product.id),
    () => { productQtys[product.id] = Math.max(1, getQty(product.id) - 1); stepper.querySelector("span").textContent = getQty(product.id); },
    () => { productQtys[product.id] = getQty(product.id) + 1; stepper.querySelector("span").textContent = getQty(product.id); });

  const addBtn = h("button", "add-btn", "Ajouter");
  addBtn.type = "button";
  addBtn.addEventListener("click", () => {
    addToCart({ id: product.id, name: product.name, priceHT: product.priceHT, qty: getQty(product.id) });
    // Petit retour visuel "✓ Ajouté" pendant 1.4s, puis retour au libellé normal :
    addBtn.classList.add("added");
    addBtn.textContent = "✓ Ajouté";
    clearTimeout(addedTimers[product.id]); // annule un précédent minuteur si l'utilisateur clique plusieurs fois vite
    addedTimers[product.id] = setTimeout(() => {
      addBtn.classList.remove("added");
      addBtn.textContent = "Ajouter";
    }, 1400);
  });

  const footer = append(h("div", "product-card-footer"), priceBlock, append(h("div", "product-card-actions"), stepper, addBtn));
  const info = append(h("div", "product-card-info"), append(h("div"), h("h3", null, product.name), h("p", "desc", product.description)), footer);

  return append(h("div", "product-card"), photo, info);
}

// Regénère toute la grille de produits en fonction du filtre actif.
function renderProductGrid() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.textContent = "";
  const filtered = activeCategory === "Tous" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);
  filtered.forEach((product) => grid.appendChild(buildProductCard(product)));
}

// Premier rendu, exécuté immédiatement au chargement du script (la page Catalogue
// doit déjà être prête même si elle n'est pas visible au tout début).
renderCategoryFilters();
renderProductGrid();


// ============================================================================
// SECTION 7 — Page Panier
// ============================================================================

// Met à jour l'apparence des deux cartes "Sur place" / "À emporter" selon orderMode.
function renderModeOptions() {
  if (!document.querySelector(".mode-option")) return;
  document.querySelectorAll(".mode-option").forEach((opt) => {
    const selected = opt.dataset.mode === orderMode;
    opt.classList.toggle("selected", selected);
    opt.querySelector("input").checked = selected; // synchronise le vrai <input type="radio"> caché
  });
}

document.querySelectorAll(".mode-option").forEach((opt) => {
  opt.addEventListener("click", () => {
    orderMode = opt.dataset.mode;
    saveState();
    renderModeOptions();
    renderCart(); // le montant de la TVA affiché dépend du mode → on recalcule les totaux
  });
});

// Construit UNE ligne du tableau du panier.
function buildCartRow(item, index, isLast) {
  const stepper = qtyStepper(item.qty,
    () => updateQty(item.lineId, item.qty - 1),
    // Le "+" crée une nouvelle ligne d'une unité au lieu d'augmenter celle-ci.
    () => { addToCart({ id: item.id, name: item.name, priceHT: item.priceHT, qty: 1 }); renderCart(); });
  const removeBtn = h("button", "remove-btn", "✕");
  removeBtn.type = "button";
  removeBtn.addEventListener("click", () => removeItem(item.lineId));

  const row = append(h("div", "cart-row"),
    h("span", "item-name", item.name),
    append(h("div", "qty-cell"), stepper),
    h("span", "price-cell", item.priceHT.toFixed(2) + " €"),
    h("span", "total-cell", (item.priceHT * item.qty).toFixed(2) + " €"),
    append(h("div", "remove-cell"), removeBtn));
  // Lignes alternées (une claire, une sombre) pour faciliter la lecture du tableau :
  row.style.background = index % 2 === 0 ? "var(--card)" : "var(--background)";
  row.style.borderBottom = isLast ? "none" : "1px solid var(--border)";
  return row;
}

// Regénère toute la page Panier : lignes du tableau, mode de consommation, totaux.
// Appelée à chaque fois que le contenu du panier ou le mode change.
function renderCart() {
  if (!document.getElementById("cart-count")) return;
  const items = totalItems();
  const countEl = document.getElementById("cart-count");
  countEl.style.display = cart.length > 0 ? "inline" : "none";
  countEl.textContent = items + " article" + (items > 1 ? "s" : "");

  const empty = document.getElementById("cart-empty");
  const content = document.getElementById("cart-content");
  empty.style.display = cart.length === 0 ? "block" : "none";
  content.style.display = cart.length === 0 ? "none" : "block";
  if (cart.length === 0) return; // panier vide → rien d'autre à calculer

  const rows = document.getElementById("cart-rows");
  rows.textContent = "";
  cart.forEach((item, i) => rows.appendChild(buildCartRow(item, i, i === cart.length - 1)));
  renderModeOptions();

  // Calcul des totaux : HT → TVA (selon le mode) → TTC.
  const ht = totalHT();
  const tva = ht * TVA_RATES[orderMode];
  const modeLabel = orderMode === "surplace" ? "10 % · sur place" : "5,5 % · à emporter";
  document.getElementById("cart-total-ht").textContent = ht.toFixed(2) + " €";
  document.getElementById("cart-tva-label").textContent = "TVA " + modeLabel;
  document.getElementById("cart-tva-value").textContent = "+ " + tva.toFixed(2) + " €";
  document.getElementById("cart-total-ttc").textContent = (ht + tva).toFixed(2) + " €";
}

if (document.getElementById("cart-pay-btn")) {
  document.getElementById("cart-pay-btn").addEventListener("click", () => goTo("payment"));
}


// ============================================================================
// SECTION 8 — Page Paiement (formulaire fictif)
// ============================================================================

// Petites fonctions de formatage de saisie (regex), utilisées pendant la frappe.
const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); // groupes de 4 chiffres
const formatExpiry = (v) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; }; // MM/AA

const payCard = document.getElementById("pay-card");
const payExpiry = document.getElementById("pay-expiry");
const payCvc = document.getElementById("pay-cvc");

// À chaque frappe, on reformate le champ ET on met à jour la carte bancaire visuelle en direct.
if (payCard) {
  payCard.addEventListener("input", () => {
  payCard.value = formatCard(payCard.value);
  document.getElementById("card-number-display").textContent = payCard.value || "•••• •••• •••• ••••";
  });
}
if (payExpiry) {
  payExpiry.addEventListener("input", () => {
  payExpiry.value = formatExpiry(payExpiry.value);
  document.getElementById("card-expiry-display").textContent = payExpiry.value || "MM/AA";
  });
}
if (payCvc) {
  payCvc.addEventListener("input", () => {
  payCvc.value = payCvc.value.replace(/\D/g, "").slice(0, 4);
  document.getElementById("card-cvc-display").textContent = payCvc.value ? "•".repeat(payCvc.value.length) : "•••";
});
}

// Remplit le récapitulatif de commande (colonne de droite) à partir du panier.
function renderPayment() {
  if (!document.getElementById("payment-submit")) return;
  const ht = totalHT();
  const tvaRate = TVA_RATES[orderMode];
  const ttc = ht * (1 + tvaRate);

  document.getElementById("payment-submit").textContent = "Payer " + ttc.toFixed(2) + " € TTC";

  const itemsEl = document.getElementById("summary-items");
  itemsEl.textContent = "";
  cart.forEach((item) => {
    const nameSpan = append(h("span", "name"), document.createTextNode(item.name), h("span", "qty", " × " + item.qty));
    itemsEl.appendChild(append(h("div", "summary-item"), nameSpan, h("span", "price", (item.priceHT * item.qty).toFixed(2) + " €")));
  });

  document.getElementById("summary-total-ht").textContent = ht.toFixed(2) + " €";
  document.getElementById("summary-tva-label").textContent = "TVA " + (orderMode === "surplace" ? "10 %" : "5,5 %");
  document.getElementById("summary-tva-value").textContent = (ht * tvaRate).toFixed(2) + " €";
  document.getElementById("summary-total-ttc").textContent = ttc.toFixed(2) + " €";
  document.getElementById("summary-mode").textContent = orderMode === "surplace" ? "🍽️ Sur place" : "🥡 À emporter";
}

// Soumission du paiement : validation basique, puis simulation d'un traitement
// (aucun vrai paiement n'est effectué — voir la mention "Paiement fictif" du HTML).
if (document.getElementById("payment-form")) {
  document.getElementById("payment-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("payment-error");
  const submitBtn = document.getElementById("payment-submit");

  let error = "";
  if (payCard.value.replace(/\s/g, "").length < 16) error = "Numéro de carte invalide.";
  else if (payCvc.value.length < 3) error = "CVC invalide.";
  else if (payExpiry.value.length < 5) error = "Date d'expiration invalide.";

  if (error) {
    errorEl.textContent = error;
    errorEl.style.display = "block";
    return;
  }
  errorEl.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.textContent = "Traitement en cours…";

  // setTimeout = on simule un délai réseau/traitement de 1.8s avant de continuer.
  setTimeout(() => {
    submitBtn.disabled = false;
    goTo("tracking");
  }, 1800);
  });
}


// ============================================================================
// SECTION 9 — Page Suivi de commande (simulation automatique, sans serveur)
// ============================================================================
// Principe : STATES décrit les 4 étapes possibles, dans l'ordre. `duration`
// (en millisecondes) = combien de temps rester sur cette étape avant de
// passer automatiquement à la suivante (0 = dernière étape, pas de suite).

const STATES = [
  { key: "attente", label: "En attente", emoji: "⏳", color: "#9e8878", duration: 4000, desc: "Votre commande a été reçue et est en file d'attente.", eta: "~15 min" },
  { key: "preparation", label: "En préparation", emoji: "👨‍🍳", color: "#e8c27a", duration: 6000, desc: "Nos cuisiniers préparent votre repas avec soin.", eta: "~8 min" },
  { key: "prete", label: "Prête !", emoji: "🔔", color: "#e8845a", duration: 5000, eta: "Maintenant" },
  { key: "servie", label: "Servie", emoji: "✅", color: "#4caf76", duration: 0, desc: "Merci pour votre visite. À très bientôt !", eta: "—" },
];

let trackingStateIdx = 0;      // index de l'étape courante dans STATES
let trackingTimer = null;      // référence au setTimeout en cours (pour pouvoir l'annuler)
let trackingStarted = false;   // empêche de relancer la simulation si on revient sur la page

// Regénère les 4 pastilles d'étapes (⏳ 👨‍🍳 🔔 ✅) en bas de la carte de statut.
function renderTrackingSteps() {
  const row = document.getElementById("steps-row");
  if (!row) return;
  row.textContent = "";
  STATES.forEach((s, i) => {
    const done = i < trackingStateIdx;    // étape déjà passée
    const active = i === trackingStateIdx; // étape en cours
    const circle = h("div", "step-circle", done ? "✓" : s.emoji);
    circle.style.background = done ? s.color : active ? "rgba(232,132,90,0.15)" : "var(--secondary)";
    circle.style.border = "2px solid " + (active || done ? s.color : "var(--border)");
    circle.style.boxShadow = active ? "0 0 16px " + s.color + "44" : "none";
    circle.style.color = done ? "#fff" : active ? s.color : "var(--muted-foreground)";
    const label = h("span", "step-label" + (active ? " active" : "") + (done ? " done" : ""), s.label);
    row.appendChild(append(h("div", "step"), circle, label));
  });
}

// Met à jour TOUT l'affichage de la page Suivi pour l'étape courante
// (emoji géant, titre, description, notification, barre de progression, détails).
function renderTracking() {
  if (!document.getElementById("tracking-order-id")) return;
  const current = STATES[trackingStateIdx];

  // document.getElementById("tracking-order-id").textContent = "#" + orderId;
  // document.getElementById("detail-order-id").textContent = "#" + orderId;
  document.getElementById("status-emoji").textContent = current.emoji;
  document.getElementById("status-emoji").style.filter = "drop-shadow(0 0 24px " + current.color + "66)";
  document.getElementById("status-blob").style.background = current.color;

  const title = document.getElementById("status-title");
  title.textContent = "";
  if (current.key === "prete") append(title, document.createTextNode("Commande "), h("em", null, "prête !"));
  else if (current.key === "servie") append(title, document.createTextNode("Bon "), h("em", null, "appétit !"));
  else title.appendChild(h("em", null, current.label));
  title.querySelector("em").style.color = current.key === "servie" ? "#4caf76" : "var(--accent)";

  document.getElementById("status-desc").textContent = current.key === "prete"
    ? (orderMode === "surplace" ? "Votre plat arrive à  votre table dans un instant." : "Venez récupérer votre commande au comptoir !")
    : current.desc;

  const notif = document.getElementById("tracking-notif");
  if (current.key === "prete") {
    document.getElementById("tracking-notif-text").textContent =
      orderMode === "surplace" ? "Votre plat arrive !" : "Prêt à  être récupéré au comptoir !";
    setTimeout(() => notif.classList.add("visible"), 400); // léger délai pour un effet d'apparition
  } else {
    notif.classList.remove("visible");
  }

  const fill = document.getElementById("progress-fill");
  fill.style.width = (trackingStateIdx / (STATES.length - 1)) * 100 + "%";
  fill.style.background = "linear-gradient(90deg, var(--primary), " + current.color + ")";

  renderTrackingSteps();

  document.getElementById("detail-mode").textContent = orderMode === "surplace" ? "🍽️ Sur place" : "🥡 À emporter";
  const statusPill = document.getElementById("detail-status");
  statusPill.style.background = current.color + "18"; // "18" = transparence ajoutée au code couleur hexadécimal
  statusPill.style.color = current.color;
  statusPill.style.border = "1px solid " + current.color + "40";
  statusPill.textContent = current.emoji + " " + current.label;

  document.getElementById("detail-eta").textContent = current.eta;
  document.getElementById("new-order-btn").classList.toggle("visible", current.key === "servie");
}

// Fait avancer automatiquement le suivi d'une étape à l'autre après le délai défini,
// en se rappelant elle-même (setTimeout en chaîne) jusqu'à la dernière étape.
// C'est cette fonction qui simule la progression réelle d'une commande, sans backend.
function scheduleNextTrackingStep() {
  clearTimeout(trackingTimer);
  if (trackingStateIdx >= STATES.length - 1) return; // dernière étape atteinte → on arrête la chaîne
  trackingTimer = setTimeout(() => {
    trackingStateIdx += 1;
    renderTracking();
    scheduleNextTrackingStep(); // relance le minuteur pour l'étape suivante
  }, STATES[trackingStateIdx].duration);
}

// Point d'entrée de la page Suivi, appelé par goTo("tracking").
// Le "if (trackingStarted) return" empêche de relancer une 2e simulation en parallèle.
function startTracking() {
  if (trackingStarted) return;
  trackingStarted = true;
  renderTracking();
  scheduleNextTrackingStep();
}

if (document.getElementById("new-order-btn")) {
  document.getElementById("new-order-btn").addEventListener("click", () => {
    localStorage.removeItem("restoweb_cart");
    localStorage.removeItem("restoweb_order_id");
    window.location.href = PAGE_URLS.catalog;
  });
}


// ============================================================================
// SECTION 10 — Initialisation générale
// ============================================================================
// Exécuté une seule fois, au chargement du script : met les badges du panier
// à zéro dès le départ (utile si jamais ce script était un jour rechargé).
updateCartBadges();




if (document.getElementById("page-cart")) renderCart();
if (document.getElementById("page-payment")) renderPayment();
if (document.getElementById("page-tracking")) startTracking();
