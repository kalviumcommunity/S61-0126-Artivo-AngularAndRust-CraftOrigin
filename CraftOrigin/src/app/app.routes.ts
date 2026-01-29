import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { HomeComponent } from '../components/LandingPage/Home/home';
import { AboutUsComponent } from '../components/LandingPage/AboutUs/aboutUs';
import { SellArtComponent } from '../components/LandingPage/SellArt/sellArt';
import { ArtistOnboardingComponent } from '../components/ArtistOnboarding/ArtistOnboarding';
import { RegisterComponent } from '../components/LandingPage/Register/register';
import { LoginComponent } from '../components/LandingPage/Login/login';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutUsComponent
  },
  {
    path: 'sell-art',
    component: SellArtComponent
  },
  {
    path: 'artist-onboarding',
    component: ArtistOnboardingComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'marketplace',
    canActivate: [authGuard],
    loadComponent: () => import('../components/buyer-dashboard/marketplace-feed/marketplace-feed.component').then(m => m.MarketplaceFeedComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('../components/buyer-dashboard/buyer-dashboard.component').then(m => m.BuyerDashboardComponent),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadComponent: () => import('../components/buyer-dashboard/profile/profile.component').then(m => m.BuyerProfileComponent) },
      { path: 'orders', loadComponent: () => import('../components/buyer-dashboard/orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'wishlist', loadComponent: () => import('../components/buyer-dashboard/wishlist/wishlist.component').then(m => m.WishlistComponent) },
      { path: 'addresses', loadComponent: () => import('../components/buyer-dashboard/addresses/addresses.component').then(m => m.BuyerAddressesComponent) },
      { path: 'settings', loadComponent: () => import('../components/buyer-dashboard/settings/settings.component').then(m => m.BuyerSettingsComponent) }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
