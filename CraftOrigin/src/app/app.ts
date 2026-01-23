import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductService } from './services/product.service';
import { NavbarComponent } from '../components/LandingPage/Navigation/navagation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('CraftOrigin');

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