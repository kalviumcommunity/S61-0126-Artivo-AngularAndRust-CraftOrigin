import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { ArtworkService } from '../../../app/services/artwork.service';
import { Artwork, ARTWORK_CATEGORIES } from '../../../app/models/artwork.model';

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
export class ProductGalleryComponent implements OnInit {
  isBrowser = false;

  // Use backend categories to avoid filter mismatch
  categories: string[] = ['All', ...ARTWORK_CATEGORIES];

  selectedCategory = 'All';
  products: Product[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private router: Router) {
    this.isBrowser = isPlatformBrowser(this.platformId);

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/300';
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  get filteredProducts(): Product[] {
    if (this.selectedCategory === 'All') {
      return this.products;
    }
    return this.products.filter(
      (p) => p.category === this.selectedCategory
    );
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallbackUrl = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80';
    // Prevent infinite loop if fallback also fails
    if (img.src === fallbackUrl) {
      return;
    }
    img.src = fallbackUrl;
  }

  private loadFeaturedArtworks(): void {
    this.artworkService.getArtworks({ limit: 8, page: 1 }).subscribe({
      next: (res: { data: Artwork[] } | Artwork[]) => {
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        this.products = list.map((a) => ({
          name: a.title,
          artist: 'Artist',
          price: typeof (a as any).price === 'string' ? parseFloat((a as any).price) : (a as any).price || 0,
          originalPrice: null,
          image: this.getImageUrl(a.image_url),
          category: a.category,
          isNew:
            !!a.created_at &&
            Date.now() - new Date(a.created_at).getTime() <
              1000 * 60 * 60 * 24 * 30,
        }));
      },
      error: () => {
        this.products = [];
      },
    });
  }

  private getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // If it's a relative path starting with /, assume it's from backend
    if (url.startsWith('/')) return `http://localhost:8080${url}`;
    return url;
  }
}
