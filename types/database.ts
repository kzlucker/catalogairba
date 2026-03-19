/**
 * Типы, соответствующие структуре таблиц Supabase (PostgreSQL).
 */

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  weight_info: string | null;
  barcode: string | null;
  composition: string | null;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  image_url: string | null;
  is_active: boolean;
  category_id: string | null;
  created_at: string;
}

/** Продукт с подгруженным названием категории (select('*, categories(name)')). */
export type ProductWithCategory = Product & {
  categories: { name: string } | null;
};
