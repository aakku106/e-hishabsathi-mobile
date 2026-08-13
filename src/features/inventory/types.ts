export type Product = {
  id: number;
  name: string;
  category: string | null;
  price: number;
  costPrice: number | null;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductInput = {
  name: string;
  category?: string | null;
  price: number;
  costPrice?: number | null;
  stockQuantity?: number;
};

export type ProductSummary = {
  productCount: number;
  totalUnits: number;
  totalStockValue: number;
  lowStockCount: number;
};
