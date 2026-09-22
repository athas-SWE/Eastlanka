import { Routes } from '@angular/router';
import { About } from './pages/about/about';
import { Categories } from './pages/categories/categories';
import { CategoryProducts } from './pages/category-products/category-products';
import { Contact } from './pages/contact/contact';
import { Home } from './pages/home/home';
import { NewArrivals } from './pages/new-arrivals/new-arrivals';
import { Offers } from './pages/offers/offers';
import { ProductDetails } from './pages/product-details/product-details';
import { Products } from './pages/products/products';

export const routes: Routes = [
  { path: '', component: Home, title: 'East Lanka | New Products • Better Tomorrow' },
  { path: 'products', component: Products, title: 'Products | East Lanka' },
  { path: 'products/:code', component: ProductDetails },
  { path: 'categories', component: Categories, title: 'Categories | East Lanka' },
  { path: 'categories/:slug', component: CategoryProducts },
  { path: 'new-arrivals', component: NewArrivals, title: 'New Arrivals | East Lanka' },
  { path: 'offers', component: Offers, title: 'Offers | East Lanka' },
  { path: 'about', component: About, title: 'About East Lanka' },
  { path: 'contact', component: Contact, title: 'Contact | East Lanka' },
  { path: '**', redirectTo: '' },
];
