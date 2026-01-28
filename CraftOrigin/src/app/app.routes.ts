import { Routes } from '@angular/router';
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
    path: '**',
    redirectTo: ''
  }
];
