import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from '../LandingPage/HeroSection/heroSection';
import { FeaturedArtistsComponent } from '../LandingPage/FeaturedArtists/featuredArtists';
import { ProductGalleryComponent } from '../LandingPage/FeaturedArtWorks/FeaturedArtWork';
import { HowItWorksComponent } from '../LandingPage/HowItWorks/howItWorks';
import { CallToActionComponent } from '../LandingPage/CallToAction/CallToAction';
import { FooterComponent } from '../LandingPage/Footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    FeaturedArtistsComponent,
    ProductGalleryComponent,
    HowItWorksComponent,
    CallToActionComponent,
    FooterComponent
  ],
  template: `
    <div>
      <app-hero-section></app-hero-section>
      <app-featured-artists></app-featured-artists>
      <app-product-gallery></app-product-gallery>
      <app-how-it-works></app-how-it-works>
      <app-call-to-action></app-call-to-action>
      <app-footer></app-footer>
    </div>
  `
})
export class HomeComponent {}