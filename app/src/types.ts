export interface CartItem {
  id: number;
  name: string;
  priceHT: number;
  qty: number;
}

export type OrderMode = "emporter" | "surplace";
