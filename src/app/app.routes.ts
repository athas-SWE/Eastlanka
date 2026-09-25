import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { About } from './pages/about/about';
import { AdminCategories } from './pages/admin/admin-categories';
import { AdminCategoryForm } from './pages/admin/admin-category-form';
import { AdminDashboard } from './pages/admin/admin-dashboard';
import { AdminLogin } from './pages/admin/admin-login';
import { AdminProductForm } from './pages/admin/admin-product-form';
import { AdminProducts } from './pages/admin/admin-products';
import { AdminShell } from './pages/admin/admin-shell';
import { Categories } from './pages/categories/categories';
import { CategoryProducts } from './pages/category-products/category-products';
import { Contact } from './pages/contact/contact';
import { Home } from './pages/home/home';
import { Media } from './pages/media/media';
import { NewArrivals } from './pages/new-arrivals/new-arrivals';
import { Offers } from './pages/offers/offers';
import { Order } from './pages/order/order';
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
  { path: 'order', component: Order, title: 'Your order | East Lanka' },
  { path: 'about', component: About, title: 'About East Lanka' },
  { path: 'contact', component: Contact, title: 'Contact | East Lanka' },
  { path: 'admin/login', component: AdminLogin, title: 'Admin sign in | East Lanka' },
  {
    path: 'admin',
    canActivate: [adminGuard],
    component: AdminShell,
    children: [
      { path: '', component: AdminDashboard, title: 'Admin | East Lanka' },
      { path: 'products', component: AdminProducts, title: 'Admin products | East Lanka' },
      { path: 'products/new', component: AdminProductForm, title: 'Add product | East Lanka' },
      { path: 'products/:code', component: AdminProductForm, title: 'Edit product | East Lanka' },
      { path: 'categories', component: AdminCategories, title: 'Admin categories | East Lanka' },
      { path: 'categories/new', component: AdminCategoryForm, title: 'Add category | East Lanka' },
      { path: 'categories/:slug', component: AdminCategoryForm, title: 'Edit category | East Lanka' },
      { path: 'media', component: Media, title: 'Upload images | East Lanka' },
    ],
  },
  { path: '**', redirectTo: '' },
];
