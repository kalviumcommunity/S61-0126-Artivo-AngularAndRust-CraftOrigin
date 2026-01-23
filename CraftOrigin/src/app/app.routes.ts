import { Routes } from '@angular/router';
import { ArtistOnboardingComponent } from '../components/ArtistOnboarding/ArtistOnboarding';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('../components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'artist-onboarding',
    component: ArtistOnboardingComponent
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];