import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductService } from './services/product.service';
import { HeroSectionComponent } from '../components/LandingPage/HeroSection/heroSection';
import { NavbarComponent } from '../components/LandingPage/Navigation/navagation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeroSectionComponent, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('CraftOrigin');

  // Inject ProductService to call getProducts()
  constructor(private productService: ProductService) {}

  // Call getProducts on app initialization to display mock data in console
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
