export type CategorySlug = string;

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
  image: string;
}

export interface CatalogueSnapshot {
  updatedAt: string;
  products: Product[];
  categories: Category[];
}

export interface Product {
  id: number;
  code: string;
  name: string;
  category: CategorySlug;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  available: boolean;
  newArrival?: boolean;
  facebookPostId?: string;
}
