import { Category } from '../models/product.model';

export const CATEGORIES: Category[] = [
  {
    slug: 'electronics',
    name: 'Electronics',
    blurb: 'Everyday tech that keeps you connected',
    image: 'assets/categories/electronics.svg',
  },
  {
    slug: 'fashion',
    name: 'Fashion',
    blurb: 'Simple pieces for work and weekend',
    image: 'assets/categories/fashion.svg',
  },
  {
    slug: 'home',
    name: 'Home',
    blurb: 'Warm, useful things for living well',
    image: 'assets/categories/home.svg',
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    blurb: 'Small details that finish the look',
    image: 'assets/categories/accessories.svg',
  },
  {
    slug: 'gifts',
    name: 'Gifts',
    blurb: 'Ready-to-give finds for any occasion',
    image: 'assets/categories/gifts.svg',
  },
];
