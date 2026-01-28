import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

interface Product {
  name: string;
  artist: string;
  price: number;
  originalPrice: number | null;
  image: string;
  category: string;
  isNew: boolean;
}

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './FeaturedArtWork.html',
  styleUrls: ['./FeaturedArtWork.css'],
})
export class ProductGalleryComponent {
  isBrowser: boolean;
  categories: string[] = [
    'All',
    'Pottery',
    'Textiles',
    'Paintings',
    'Sculptures',
  ];

  selectedCategory = 'All';

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/300';
  }

  products: Product[] = [
    {
      name: 'Traditional Terracotta Vase',
      artist: 'Lakshmi Devi',
      price: 2499,
      originalPrice: 3200,
      image: 'assets/product-1.jpg',
      category: 'Pottery',
      isNew: true,
    },
    {
      name: 'Handwoven Tribal Tapestry',
      artist: 'Ramesh Kumar',
      price: 4999,
      originalPrice: 6500,
      image: 'assets/product-2.jpg',
      category: 'Textiles',
      isNew: false,
    },
    {
      name: 'Warli Art Canvas',
      artist: 'Meera Bhil',
      price: 3499,
      originalPrice: null,
      image: 'assets/product-3.jpg',
      category: 'Paintings',
      isNew: true,
    },
    {
      name: 'Carved Wooden Tribal Mask',
      artist: 'Govind Tribal',
      price: 1899,
      originalPrice: 2400,
      image: 'assets/product-4.jpg',
      category: 'Sculptures',
      isNew: false,
    },
  ];

  get filteredProducts(): Product[] {
    if (this.selectedCategory === 'All') {
      return this.products;
    }
    return this.products.filter(
      (product) => product.category === this.selectedCategory
    );
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }
}
