export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiry: string;
  price: number;
  minStock?: number;
  image?: string;
  emoji?: string;
}

export type PaymentMethod = 'pix' | 'debito' | 'credito' | 'dinheiro';

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  productEmoji?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  date: Date;
}

export interface ReplenishmentRequest {
  id: string;
  productId: string;
  productName: string;
  productEmoji?: string;
  currentQty: number;
  minStock: number;
  suggestedQty: number;
  date: Date;
  confirmed: boolean;
}
