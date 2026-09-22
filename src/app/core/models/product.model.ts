export type CategorySlug = 'electronics' | 'fashion' | 'home' | 'accessories' | 'gifts';

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
  image: string;
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
}
