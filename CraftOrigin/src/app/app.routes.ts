import { Routes } from '@angular/router';
import { AboutUsComponent } from '../components/LandingPage/AboutUs/aboutUs';
import { HomeComponent } from '../components/LandingPage/Home/home';
import { SellArtComponent } from '../components/LandingPage/SellArt/sellArt';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutUsComponent
  },
  {
    path: 'sell-art',
    component: SellArtComponent
  }
];
