import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../app/services/product.service';
import { HeroSectionComponent } from '../HeroSection/heroSection';
import { FeaturedArtistsComponent } from '../FeaturedArtists/featuredArtists';
import { ProductGalleryComponent } from '../FeaturedArtWorks/FeaturedArtWork';
import { HowItWorksComponent } from '../HowItWorks/howItWorks';
import { CallToActionComponent } from '../CallToAction/CallToAction';
import { FooterComponent } from '../Footer/footer.component';

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
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('✅ Products loaded successfully!');
        console.log('📦 Products array:', products);
      },
      error: (error) => {
        console.error('❌ Error loading products:', error);
      }
    });
  }
}
