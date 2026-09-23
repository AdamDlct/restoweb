// ============================================================================
// app.js â€” tout le comportement du site (une seule page HTML, pas de framework)
// ============================================================================
// Grands principes utilisÃ©s dans ce fichier :
//  1. SPA maison : une seule fonction goTo(page) montre/cache les sections.
//  2. Ã‰tat global : quelques variables (cart, orderMode...) reprÃ©sentent
//     "ce qui se passe" dans l'appli. Chaque action (clic, saisie) modifie
//     cet Ã©tat PUIS relance une fonction "render..." qui remet Ã  jour le HTML.
//     â†’ Modifier l'Ã©tat sans re-render ne change rien Ã  l'Ã©cran.
//     â†’ Toujours re-render aprÃ¨s avoir modifiÃ© l'Ã©tat.
//  3. Pas de framework (React, Vue...) : on manipule le DOM "Ã  la main" avec
//     document.getElementById / querySelector / addEventListener.
//  4. SÃ©curitÃ© : jamais de innerHTML avec du texte dynamique (risque de faille
//     XSS si une donnÃ©e contenait du HTML). On construit les Ã©lÃ©ments avec
//     document.createElement() et on insÃ¨re le texte avec .textContent
//     (voir les petites fonctions utilitaires h() et append() ci-dessous).
// ============================================================================


// ============================================================================
// SECTION 1 â€” Fonctions utilitaires DOM (gÃ©nÃ©riques, utilisÃ©es partout)
// ============================================================================

// CrÃ©e un Ã©lÃ©ment HTML : h("button", "ma-classe", "Texte du bouton")
function h(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text; // .textContent = texte brut, jamais interprÃ©tÃ© comme du HTML
  return node;
}

// Ajoute plusieurs enfants Ã  un parent en une seule fois, puis renvoie le parent
// (permet d'enchaÃ®ner : append(h("div"), enfant1, enfant2))
function append(parent, ...children) {
  children.forEach((c) => c && parent.appendChild(c));
  return parent;
}

// Composant rÃ©utilisable : le petit stepper [ âˆ’ 1 + ] de quantitÃ©.
// UtilisÃ© Ã  deux endroits diffÃ©rents (carte produit du catalogue ET ligne du
// panier) â†’ on l'Ã©crit une seule fois ici plutÃ´t que de dupliquer le code.
function qtyStepper(qty, onDec, onInc) {
  const label = h("span", null, String(qty));
  const dec = h("button", null, "âˆ’");
  const inc = h("button", null, "+");
  dec.type = inc.type = "button"; // Ã©vite qu'un bouton dans un <form> dÃ©clenche un submit
  dec.addEventListener("click", onDec);
  inc.addEventListener("click", onInc);
  return append(h("div", "qty-stepper"), dec, label, inc);
}


// ============================================================================
// SECTION 2 â€” Ã‰tat global de l'application
// ============================================================================
// Ces variables dÃ©crivent l'Ã©tat courant du "faux backend" cÃ´tÃ© client.
// Elles sont lues et modifiÃ©es par plusieurs pages (catalogue, panier, paiement).

let cart = [];                       // Panier : liste de { id, name, priceHT, qty }
let orderMode = "surplace";          // "surplace" ou "emporter" â†’ change le taux de TVA
let orderId = Math.floor(Math.random() * 9000) + 1000; // NumÃ©ro de commande, gÃ©nÃ©rÃ© une seule fois au chargement
const TVA_RATES = { emporter: 0.055, surplace: 0.10 };    // Taux de TVA franÃ§ais
const PAGE_URLS = {
  auth: "index.html",
  catalog: "catalogue.html",
  cart: "panier.html",
  payment: "paiement.html",
  tracking: "suivi-commande.html",
};

function loadState() {
  try {
    cart = JSON.parse(localStorage.getItem("restoweb_cart")) || [];
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
// SECTION 3 â€” Navigation entre les "pages" (SPA sans routeur)
// ============================================================================
// Principe : chaque page est un <div class="page" id="page-xxx"> dans le HTML.
// goTo("xxx") retire la classe "active" Ã  toutes les pages puis l'ajoute
// uniquement Ã  la page ciblÃ©e (voir css/style.css â†’ ".page" / ".page.active").
// C'est TOUTE la "navigation" du site : pas de changement d'URL, pas de rechargement.

function goTo(page) {
  saveState();
  window.location.href = PAGE_URLS[page] || PAGE_URLS.auth;
}

// DÃ©lÃ©gation gÃ©nÃ©rique : tout Ã©lÃ©ment avec l'attribut data-nav="xxx" devient
// un bouton de navigation vers la page "xxx", sans avoir Ã  Ã©crire un
// addEventListener sÃ©parÃ© pour chaque bouton "retour" du site.
document.querySelectorAll("[data-nav]").forEach((elt) => elt.addEventListener("click", () => goTo(elt.dataset.nav)));


// ============================================================================
// SECTION 4 â€” Panier : opÃ©rations sur les donnÃ©es (indÃ©pendantes de l'affichage)
// ============================================================================
// Ces fonctions ne touchent QUE le tableau `cart`. L'affichage est mis Ã  jour
// sÃ©parÃ©ment (updateCartBadges / renderCart), ce qui sÃ©pare bien "les donnÃ©es"
// du "rendu visuel".

function addToCart(item) {
  const existing = cart.find((c) => c.id === item.id);
  if (existing) existing.qty += item.qty; // produit dÃ©jÃ  prÃ©sent â†’ on additionne les quantitÃ©s
  else cart.push(item);                   // sinon on l'ajoute comme nouvelle ligne
  saveState();
  updateCartBadges();
}

function updateQty(id, qty) {
  if (qty <= 0) cart = cart.filter((c) => c.id !== id); // quantitÃ© Ã  0 â†’ on retire l'article
  else cart.find((c) => c.id === id).qty = qty;
  saveState();
  updateCartBadges();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((c) => c.id !== id);
  saveState();
  updateCartBadges();
  renderCart();
}

// Petites fonctions "calculÃ©es" Ã  partir de l'Ã©tat du panier (jamais stockÃ©es, toujours recalculÃ©es)
const totalItems = () => cart.reduce((s, c) => s + c.qty, 0);
const totalHT = () => cart.reduce((s, c) => s + c.priceHT * c.qty, 0);

// Met Ã  jour le badge du panier dans le header du catalogue ET la barre flottante en bas d'Ã©cran.
// AppelÃ©e aprÃ¨s CHAQUE modification du panier, oÃ¹ que l'on soit sur le site.
function updateCartBadges() {
  if (!document.getElementById("catalog-cart-btn")) return;
  const items = totalItems();
  const total = totalHT();

  document.getElementById("catalog-cart-btn").classList.toggle("has-items", items > 0);
  document.getElementById("catalog-cart-badge").style.display = items > 0 ? "flex" : "none";
  document.getElementById("catalog-cart-badge").textContent = items;
  document.getElementById("catalog-cart-label").textContent = items > 0 ? total.toFixed(2) + " â‚¬ HT" : "Panier";

  document.getElementById("floating-cart").classList.toggle("visible", items > 0);
  document.getElementById("floating-cart-badge").textContent = items;
  document.getElementById("floating-cart-total").textContent = total.toFixed(2) + " â‚¬";
}

if (document.getElementById("catalog-cart-btn")) {
  document.getElementById("catalog-cart-btn").addEventListener("click", () => goTo("cart"));
}
if (document.getElementById("floating-cart-btn")) {
  document.getElementById("floating-cart-btn").addEventListener("click", () => goTo("cart"));
}


// ============================================================================
// SECTION 5 â€” Page Auth (connexion / inscription)
// ============================================================================

let authMode = "login"; // "login" ou "register" : dÃ©termine quels champs afficher

// Clic sur un onglet "Connexion" / "Inscription" â†’ on adapte le formulaire
// (champs visibles, textes, placeholders) SANS recharger la page.
document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    authMode = tab.dataset.mode;
    const isRegister = authMode === "register";

    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.toggle("active", t === tab));
    document.getElementById("field-login-register").classList.toggle("hidden-field", !isRegister);
    document.getElementById("field-confirm").classList.toggle("hidden-field", !isRegister);
    document.getElementById("field-main-label").textContent = isRegister ? "Email" : "Login ou Email";
    document.getElementById("main-id").placeholder = isRegister ? "email@exemple.fr" : "pseudo ou email@...";
    document.getElementById("main-id").type = isRegister ? "email" : "text";

    const title = document.getElementById("auth-title");
    title.textContent = "";
    if (isRegister) append(title, h("em", null, "CrÃ©er"), document.createTextNode(" un compte"));
    else title.textContent = "Bon retour";

    document.getElementById("auth-subtitle").textContent = isRegister
      ? "Rejoignez-nous et commandez en quelques secondes."
      : "Connectez-vous pour accÃ©der Ã  la carte.";
    document.getElementById("auth-submit").textContent = isRegister ? "CrÃ©er mon compte â†’" : "Se connecter â†’";
    document.getElementById("auth-error").style.display = "none";
  });
});

// Soumission du formulaire : validation simple cÃ´tÃ© client uniquement
// (aucun vrai compte n'est crÃ©Ã©, il n'y a pas de serveur derriÃ¨re ce site).
if (document.getElementById("auth-form")) {
  document.getElementById("auth-form").addEventListener("submit", (e) => {
  e.preventDefault(); // empÃªche le rechargement de page par dÃ©faut du <form>
  const errorEl = document.getElementById("auth-error");
  const login = document.getElementById("reg-login").value;
  const mainId = document.getElementById("main-id").value;
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  let error = "";
  if (authMode === "register") {
    if (!login || !mainId || !password || !confirm) error = "Veuillez remplir tous les champs.";
    else if (password !== confirm) error = "Les mots de passe ne correspondent pas.";
  } else if (!mainId || !password) {
    error = "Identifiant et mot de passe requis.";
  }

  if (error) {
    errorEl.textContent = error;
    errorEl.style.display = "block";
    return; // on arrÃªte ici : pas de navigation tant que le formulaire est invalide
  }
  errorEl.style.display = "none";
  goTo("catalog");
  });
}


// ============================================================================
// SECTION 6 â€” Page Catalogue (liste des produits + filtres)
// ============================================================================
// Principe : le HTML contient des conteneurs vides (#category-filters,
// #product-grid). Ici on les remplit dynamiquement Ã  partir de PRODUCTS et
// CATEGORIES (dÃ©clarÃ©s dans data.js), puis on les rÃ©gÃ©nÃ¨re Ã  chaque clic
// sur un filtre de catÃ©gorie.

let activeCategory = "Tous";        // catÃ©gorie actuellement sÃ©lectionnÃ©e
const productQtys = {};             // quantitÃ© choisie par produit AVANT ajout au panier, ex: {3: 2}
const addedTimers = {};             // un setTimeout par produit, pour le petit "âœ“ AjoutÃ©" temporaire
const getQty = (id) => productQtys[id] ?? 1; // 1 par dÃ©faut si jamais modifiÃ©

function renderCategoryFilters() {
  const container = document.getElementById("category-filters");
  if (!container) return;
  container.textContent = ""; // on vide avant de re-gÃ©nÃ©rer (Ã©vite les doublons)
  ["Tous", ...CATEGORIES].forEach((cat) => {
    const btn = h("button", "category-chip" + (cat === activeCategory ? " active" : ""), cat);
    btn.type = "button";
    btn.addEventListener("click", () => {
      activeCategory = cat;
      renderCategoryFilters(); // on re-dessine les filtres (pour dÃ©placer le style "active")
      renderProductGrid();     // ... et la grille filtrÃ©e
    });
    container.appendChild(btn);
  });
}

// Construit UNE carte produit (photo, nom, description, prix, stepper, bouton "Ajouter").
function buildProductCard(product) {
  const img = h("img", "product-card-img");
  img.src = product.imageUrl;
  img.alt = product.name;
  img.style.opacity = "0"; // masquÃ© tant que l'image n'a pas fini de charger
  const emojiFallback = h("div", "product-card-emoji", product.emoji);
  img.addEventListener("load", () => {
    img.style.opacity = "1";
    emojiFallback.style.display = "none"; // l'emoji de secours disparaÃ®t une fois la vraie photo chargÃ©e
  });

  const photo = append(h("div", "product-card-photo"),
    img, emojiFallback, h("div", "product-card-fade"), h("span", "product-card-badge", product.category));

  const priceBlock = append(h("div", "product-card-price"),
    h("span", "amount", product.priceHT.toFixed(2)), h("span", "unit", "â‚¬ HT"));

  // Stepper de quantitÃ© (avant ajout au panier) : met Ã  jour productQtys puis le texte affichÃ©.
  const stepper = qtyStepper(getQty(product.id),
    () => { productQtys[product.id] = Math.max(1, getQty(product.id) - 1); stepper.querySelector("span").textContent = getQty(product.id); },
    () => { productQtys[product.id] = getQty(product.id) + 1; stepper.querySelector("span").textContent = getQty(product.id); });

  const addBtn = h("button", "add-btn", "Ajouter");
  addBtn.type = "button";
  addBtn.addEventListener("click", () => {
    addToCart({ id: product.id, name: product.name, priceHT: product.priceHT, qty: getQty(product.id) });
    // Petit retour visuel "âœ“ AjoutÃ©" pendant 1.4s, puis retour au libellÃ© normal :
    addBtn.classList.add("added");
    addBtn.textContent = "âœ“ AjoutÃ©";
    clearTimeout(addedTimers[product.id]); // annule un prÃ©cÃ©dent minuteur si l'utilisateur clique plusieurs fois vite
    addedTimers[product.id] = setTimeout(() => {
      addBtn.classList.remove("added");
      addBtn.textContent = "Ajouter";
    }, 1400);
  });

  const footer = append(h("div", "product-card-footer"), priceBlock, append(h("div", "product-card-actions"), stepper, addBtn));
  const info = append(h("div", "product-card-info"), append(h("div"), h("h3", null, product.name), h("p", "desc", product.description)), footer);

  return append(h("div", "product-card"), photo, info);
}

// RegÃ©nÃ¨re toute la grille de produits en fonction du filtre actif.
function renderProductGrid() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;
  grid.textContent = "";
  const filtered = activeCategory === "Tous" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);
  filtered.forEach((product) => grid.appendChild(buildProductCard(product)));
}

// Premier rendu, exÃ©cutÃ© immÃ©diatement au chargement du script (la page Catalogue
// doit dÃ©jÃ  Ãªtre prÃªte mÃªme si elle n'est pas visible au tout dÃ©but).
renderCategoryFilters();
renderProductGrid();


// ============================================================================
// SECTION 7 â€” Page Panier
// ============================================================================

// Met Ã  jour l'apparence des deux cartes "Sur place" / "Ã€ emporter" selon orderMode.
function renderModeOptions() {
  if (!document.querySelector(".mode-option")) return;
  document.querySelectorAll(".mode-option").forEach((opt) => {
    const selected = opt.dataset.mode === orderMode;
    opt.classList.toggle("selected", selected);
    opt.querySelector("input").checked = selected; // synchronise le vrai <input type="radio"> cachÃ©
  });
}

document.querySelectorAll(".mode-option").forEach((opt) => {
  opt.addEventListener("click", () => {
    orderMode = opt.dataset.mode;
    saveState();
    renderModeOptions();
    renderCart(); // le montant de la TVA affichÃ© dÃ©pend du mode â†’ on recalcule les totaux
  });
});

// Construit UNE ligne du tableau du panier.
function buildCartRow(item, index, isLast) {
  const stepper = qtyStepper(item.qty,
    () => updateQty(item.id, item.qty - 1),
    () => updateQty(item.id, item.qty + 1));
  const removeBtn = h("button", "remove-btn", "âœ•");
  removeBtn.type = "button";
  removeBtn.addEventListener("click", () => removeItem(item.id));

  const row = append(h("div", "cart-row"),
    h("span", "item-name", item.name),
    append(h("div", "qty-cell"), stepper),
    h("span", "price-cell", item.priceHT.toFixed(2) + " â‚¬"),
    h("span", "total-cell", (item.priceHT * item.qty).toFixed(2) + " â‚¬"),
    append(h("div", "remove-cell"), removeBtn));
  // Lignes alternÃ©es (une claire, une sombre) pour faciliter la lecture du tableau :
  row.style.background = index % 2 === 0 ? "var(--card)" : "var(--background)";
  row.style.borderBottom = isLast ? "none" : "1px solid var(--border)";
  return row;
}

// RegÃ©nÃ¨re toute la page Panier : lignes du tableau, mode de consommation, totaux.
// AppelÃ©e Ã  chaque fois que le contenu du panier ou le mode change.
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
  if (cart.length === 0) return; // panier vide â†’ rien d'autre Ã  calculer

  const rows = document.getElementById("cart-rows");
  rows.textContent = "";
  cart.forEach((item, i) => rows.appendChild(buildCartRow(item, i, i === cart.length - 1)));
  renderModeOptions();

  // Calcul des totaux : HT â†’ TVA (selon le mode) â†’ TTC.
  const ht = totalHT();
  const tva = ht * TVA_RATES[orderMode];
  const modeLabel = orderMode === "surplace" ? "10 % Â· sur place" : "5,5 % Â· Ã  emporter";
  document.getElementById("cart-total-ht").textContent = ht.toFixed(2) + " â‚¬";
  document.getElementById("cart-tva-label").textContent = "TVA " + modeLabel;
  document.getElementById("cart-tva-value").textContent = "+ " + tva.toFixed(2) + " â‚¬";
  document.getElementById("cart-total-ttc").textContent = (ht + tva).toFixed(2) + " â‚¬";
}

if (document.getElementById("cart-pay-btn")) {
  document.getElementById("cart-pay-btn").addEventListener("click", () => goTo("payment"));
}


// ============================================================================
// SECTION 8 â€” Page Paiement (formulaire fictif)
// ============================================================================

// Petites fonctions de formatage de saisie (regex), utilisÃ©es pendant la frappe.
const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); // groupes de 4 chiffres
const formatExpiry = (v) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d; }; // MM/AA

const payCard = document.getElementById("pay-card");
const payExpiry = document.getElementById("pay-expiry");
const payCvc = document.getElementById("pay-cvc");

// Ã€ chaque frappe, on reformate le champ ET on met Ã  jour la carte bancaire visuelle en direct.
if (payCard) {
  payCard.addEventListener("input", () => {
  payCard.value = formatCard(payCard.value);
  document.getElementById("card-number-display").textContent = payCard.value || "â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢";
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
  document.getElementById("card-cvc-display").textContent = payCvc.value ? "â€¢".repeat(payCvc.value.length) : "â€¢â€¢â€¢";
});
}

// Remplit le rÃ©capitulatif de commande (colonne de droite) Ã  partir du panier.
function renderPayment() {
  if (!document.getElementById("payment-submit")) return;
  const ht = totalHT();
  const tvaRate = TVA_RATES[orderMode];
  const ttc = ht * (1 + tvaRate);

  document.getElementById("payment-submit").textContent = "Payer " + ttc.toFixed(2) + " â‚¬ TTC";

  const itemsEl = document.getElementById("summary-items");
  itemsEl.textContent = "";
  cart.forEach((item) => {
    const nameSpan = append(h("span", "name"), document.createTextNode(item.name), h("span", "qty", " Ã— " + item.qty));
    itemsEl.appendChild(append(h("div", "summary-item"), nameSpan, h("span", "price", (item.priceHT * item.qty).toFixed(2) + " â‚¬")));
  });

  document.getElementById("summary-total-ht").textContent = ht.toFixed(2) + " â‚¬";
  document.getElementById("summary-tva-label").textContent = "TVA " + (orderMode === "surplace" ? "10 %" : "5,5 %");
  document.getElementById("summary-tva-value").textContent = (ht * tvaRate).toFixed(2) + " â‚¬";
  document.getElementById("summary-total-ttc").textContent = ttc.toFixed(2) + " â‚¬";
  document.getElementById("summary-mode").textContent = orderMode === "surplace" ? "ðŸ½ï¸ Sur place" : "ðŸ¥¡ Ã€ emporter";
}

// Soumission du paiement : validation basique, puis simulation d'un traitement
// (aucun vrai paiement n'est effectuÃ© â€” voir la mention "Paiement fictif" du HTML).
if (document.getElementById("payment-form")) {
  document.getElementById("payment-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("payment-error");
  const submitBtn = document.getElementById("payment-submit");

  let error = "";
  if (payCard.value.replace(/\s/g, "").length < 16) error = "NumÃ©ro de carte invalide.";
  else if (payCvc.value.length < 3) error = "CVC invalide.";
  else if (payExpiry.value.length < 5) error = "Date d'expiration invalide.";

  if (error) {
    errorEl.textContent = error;
    errorEl.style.display = "block";
    return;
  }
  errorEl.style.display = "none";
  submitBtn.disabled = true;
  submitBtn.textContent = "Traitement en coursâ€¦";

  // setTimeout = on simule un dÃ©lai rÃ©seau/traitement de 1.8s avant de continuer.
  setTimeout(() => {
    submitBtn.disabled = false;
    goTo("tracking");
  }, 1800);
  });
}


// ============================================================================
// SECTION 9 â€” Page Suivi de commande (simulation automatique, sans serveur)
// ============================================================================
// Principe : STATES dÃ©crit les 4 Ã©tapes possibles, dans l'ordre. `duration`
// (en millisecondes) = combien de temps rester sur cette Ã©tape avant de
// passer automatiquement Ã  la suivante (0 = derniÃ¨re Ã©tape, pas de suite).

const STATES = [
  { key: "attente", label: "En attente", emoji: "â³", color: "#9e8878", duration: 4000, desc: "Votre commande a Ã©tÃ© reÃ§ue et est en file d'attente.", eta: "~15 min" },
  { key: "preparation", label: "En prÃ©paration", emoji: "ðŸ‘¨â€ðŸ³", color: "#e8c27a", duration: 6000, desc: "Nos cuisiniers prÃ©parent votre repas avec soin.", eta: "~8 min" },
  { key: "prete", label: "PrÃªte !", emoji: "ðŸ””", color: "#e8845a", duration: 5000, eta: "Maintenant" },
  { key: "servie", label: "Servie", emoji: "âœ…", color: "#4caf76", duration: 0, desc: "Merci pour votre visite. Ã€ trÃ¨s bientÃ´t !", eta: "â€”" },
];

let trackingStateIdx = 0;      // index de l'Ã©tape courante dans STATES
let trackingTimer = null;      // rÃ©fÃ©rence au setTimeout en cours (pour pouvoir l'annuler)
let trackingStarted = false;   // empÃªche de relancer la simulation si on revient sur la page

// RegÃ©nÃ¨re les 4 pastilles d'Ã©tapes (â³ ðŸ‘¨â€ðŸ³ ðŸ”” âœ…) en bas de la carte de statut.
function renderTrackingSteps() {
  const row = document.getElementById("steps-row");
  if (!row) return;
  row.textContent = "";
  STATES.forEach((s, i) => {
    const done = i < trackingStateIdx;    // Ã©tape dÃ©jÃ  passÃ©e
    const active = i === trackingStateIdx; // Ã©tape en cours
    const circle = h("div", "step-circle", done ? "âœ“" : s.emoji);
    circle.style.background = done ? s.color : active ? "rgba(232,132,90,0.15)" : "var(--secondary)";
    circle.style.border = "2px solid " + (active || done ? s.color : "var(--border)");
    circle.style.boxShadow = active ? "0 0 16px " + s.color + "44" : "none";
    circle.style.color = done ? "#fff" : active ? s.color : "var(--muted-foreground)";
    const label = h("span", "step-label" + (active ? " active" : "") + (done ? " done" : ""), s.label);
    row.appendChild(append(h("div", "step"), circle, label));
  });
}

// Met Ã  jour TOUT l'affichage de la page Suivi pour l'Ã©tape courante
// (emoji gÃ©ant, titre, description, notification, barre de progression, dÃ©tails).
function renderTracking() {
  if (!document.getElementById("tracking-order-id")) return;
  const current = STATES[trackingStateIdx];

  document.getElementById("tracking-order-id").textContent = "#" + orderId;
  document.getElementById("detail-order-id").textContent = "#" + orderId;
  document.getElementById("status-emoji").textContent = current.emoji;
  document.getElementById("status-emoji").style.filter = "drop-shadow(0 0 24px " + current.color + "66)";
  document.getElementById("status-blob").style.background = current.color;

  const title = document.getElementById("status-title");
  title.textContent = "";
  if (current.key === "prete") append(title, document.createTextNode("Commande "), h("em", null, "prÃªte !"));
  else if (current.key === "servie") append(title, document.createTextNode("Bon "), h("em", null, "appÃ©tit !"));
  else title.appendChild(h("em", null, current.label));
  title.querySelector("em").style.color = current.key === "servie" ? "#4caf76" : "var(--accent)";

  document.getElementById("status-desc").textContent = current.key === "prete"
    ? (orderMode === "surplace" ? "Votre plat arrive Ã  votre table dans un instant." : "Venez rÃ©cupÃ©rer votre commande au comptoir !")
    : current.desc;

  const notif = document.getElementById("tracking-notif");
  if (current.key === "prete") {
    document.getElementById("tracking-notif-text").textContent =
      orderMode === "surplace" ? "Votre plat arrive !" : "PrÃªt Ã  Ãªtre rÃ©cupÃ©rÃ© au comptoir !";
    setTimeout(() => notif.classList.add("visible"), 400); // lÃ©ger dÃ©lai pour un effet d'apparition
  } else {
    notif.classList.remove("visible");
  }

  const fill = document.getElementById("progress-fill");
  fill.style.width = (trackingStateIdx / (STATES.length - 1)) * 100 + "%";
  fill.style.background = "linear-gradient(90deg, var(--primary), " + current.color + ")";

  renderTrackingSteps();

  document.getElementById("detail-mode").textContent = orderMode === "surplace" ? "ðŸ½ï¸ Sur place" : "ðŸ¥¡ Ã€ emporter";
  const statusPill = document.getElementById("detail-status");
  statusPill.style.background = current.color + "18"; // "18" = transparence ajoutÃ©e au code couleur hexadÃ©cimal
  statusPill.style.color = current.color;
  statusPill.style.border = "1px solid " + current.color + "40";
  statusPill.textContent = current.emoji + " " + current.label;

  document.getElementById("detail-eta").textContent = current.eta;
  document.getElementById("new-order-btn").classList.toggle("visible", current.key === "servie");
}

// Fait avancer automatiquement le suivi d'une Ã©tape Ã  l'autre aprÃ¨s le dÃ©lai dÃ©fini,
// en se rappelant elle-mÃªme (setTimeout en chaÃ®ne) jusqu'Ã  la derniÃ¨re Ã©tape.
// C'est cette fonction qui simule la progression rÃ©elle d'une commande, sans backend.
function scheduleNextTrackingStep() {
  clearTimeout(trackingTimer);
  if (trackingStateIdx >= STATES.length - 1) return; // derniÃ¨re Ã©tape atteinte â†’ on arrÃªte la chaÃ®ne
  trackingTimer = setTimeout(() => {
    trackingStateIdx += 1;
    renderTracking();
    scheduleNextTrackingStep(); // relance le minuteur pour l'Ã©tape suivante
  }, STATES[trackingStateIdx].duration);
}

// Point d'entrÃ©e de la page Suivi, appelÃ© par goTo("tracking").
// Le "if (trackingStarted) return" empÃªche de relancer une 2e simulation en parallÃ¨le.
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
// SECTION 10 â€” Initialisation gÃ©nÃ©rale
// ============================================================================
// ExÃ©cutÃ© une seule fois, au chargement du script : met les badges du panier
// Ã  zÃ©ro dÃ¨s le dÃ©part (utile si jamais ce script Ã©tait un jour rechargÃ©).
updateCartBadges();




if (document.getElementById("page-cart")) renderCart();
if (document.getElementById("page-payment")) renderPayment();
if (document.getElementById("page-tracking")) startTracking();
