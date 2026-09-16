// Représente une ligne du panier : un produit sélectionné avec sa quantité.
// priceHT = prix unitaire hors taxes (la TVA est calculée séparément selon le mode de commande).
export interface CartItem {
  id: number;
  name: string;
  priceHT: number;
  qty: number;
}

// Mode de consommation choisi par le client : influe sur le taux de TVA appliqué
// ("emporter" = 5,5 %, "surplace" = 10 %, voir TVA_RATES dans CartPage/PaymentPage).
export type OrderMode = "emporter" | "surplace";
