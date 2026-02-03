import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
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
    canActivate: [authGuard],
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
    path: 'artist/dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./components/artist-dashboard/artist-dashboard.component').then(m => m.ArtistDashboardComponent),
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', loadComponent: () => import('./components/artist-dashboard/overview/overview.component').then(m => m.ArtistOverviewComponent) },
      { path: 'artworks', loadComponent: () => import('./components/artist-dashboard/artworks/artworks.component').then(m => m.ArtistArtworksComponent) },
      { path: 'artworks/new', loadComponent: () => import('./components/artist-dashboard/artworks/add-artwork/add-artwork.component').then(m => m.AddArtworkComponent) },
      { path: 'orders', loadComponent: () => import('./components/artist-dashboard/orders/orders.component').then(m => m.ArtistOrdersComponent) },
      { path: 'profile', loadComponent: () => import('./components/artist-dashboard/profile/profile.component').then(m => m.ArtistProfileComponent) },
      { path: 'settings', loadComponent: () => import('./components/artist-dashboard/settings/settings.component').then(m => m.ArtistSettingsComponent) }
    ]
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
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('../components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    children: [
      { path: '', redirectTo: 'logs', pathMatch: 'full' },
      { path: 'logs', loadComponent: () => import('../components/admin-dashboard/activity-logs/activity-logs.component').then(m => m.ActivityLogsComponent) },
      { path: 'permissions', loadComponent: () => import('../components/admin-dashboard/permissions/permissions.component').then(m => m.PermissionsComponent) },
      { path: 'verification', loadComponent: () => import('../components/admin-dashboard/verification-requests/verification-requests.component').then(m => m.VerificationRequestsComponent) },
      { path: 'settings', loadComponent: () => import('../components/admin-dashboard/system-settings/system-settings.component').then(m => m.SystemSettingsComponent) }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
