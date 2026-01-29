import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtworkService } from '../../../app/services/artwork.service';
import { Artwork, ARTWORK_CATEGORIES } from '../../../app/models/artwork.model';
import { LucideAngularModule } from 'lucide-angular';
import { MarketplaceNavbarComponent } from '../marketplace-navbar/marketplace-navbar.component';
import { CartService } from '../../../app/services/cart.service';

@Component({
  selector: 'app-marketplace-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, MarketplaceNavbarComponent],
  templateUrl: './marketplace-feed.html',
  styleUrls: ['./marketplace-feed.css']
})
export class MarketplaceFeedComponent implements OnInit {
  categories = [...ARTWORK_CATEGORIES]; // Create a mutable copy
  artworksByCategory: { [key: string]: Artwork[] } = {};
  isLoading = true;
  error: string | null = null;

  constructor(
    private artworkService: ArtworkService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadArtworks();
    } else {
      // SSR: Stop loading to render empty state or just keep loading spinner
      // Better to stop loading so it renders "No artworks" or similar, or keep spinner
      // If we keep spinner, the server renders a spinner.
      // If we stop loading, we render "No artworks found yet" because list is empty.
      // Let's keep isLoading = true so the user sees a spinner until client hydrates.
      // But for Prerenderer, we want it to FINISH.
      // If isLoading is true, and we have an *ngIf="isLoading" with an animation, does it block prerender? No.
      // But we want the prerenderer to know "we are done".
      // Actually, if we just don't make the HTTP call, the component initializes and is stable.
      // So returning is enough.
    }
  }

  loadArtworks() {
    this.isLoading = true;
    this.artworkService.getArtworks({ limit: 100 }).subscribe({
      next: (response) => {
        console.log('Marketplace Feed loaded raw response:', response);
        // Handle potentially different response structures (array or object with data property)
        let artworks: Artwork[] = [];
        if (Array.isArray(response)) {
          artworks = response;
        } else if (response && Array.isArray((response as any).data)) {
          artworks = (response as any).data;
        }
        
        console.log('Parsed artworks:', artworks);
        this.groupArtworks(artworks);
        this.isLoading = false;
        this.cdr.detectChanges(); // Force change detection
      },
      error: (err) => {
        console.error('Failed to load artworks', err);
        this.error = 'Failed to load marketplace data. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  groupArtworks(artworks: Artwork[]) {
    this.artworksByCategory = {};
    // Initialize categories
    this.categories.forEach(cat => {
      this.artworksByCategory[cat] = [];
    });
    // Add "Other" category explicitly if not present
    if (!this.artworksByCategory['Other']) {
        this.artworksByCategory['Other'] = [];
    }

    // Distribute artworks
    artworks.forEach(art => {
      // Normalize category checking if needed, or just use direct match
      // Trim and ensure we match the category string exactly
      const category = art.category ? art.category.trim() : 'Other';
      
      if (this.artworksByCategory[category]) {
        this.artworksByCategory[category].push(art);
      } else {
        // Try to find a matching category if case differs
        const matchingCat = this.categories.find(c => c.toLowerCase() === category.toLowerCase());
        if (matchingCat) {
            this.artworksByCategory[matchingCat].push(art);
        } else {
            // Fallback to 'Other'
            this.artworksByCategory['Other'].push(art);
        }
      }
    });
    
    console.log('Grouped artworks:', this.artworksByCategory);
    
    // Debug: Check if we have any data to show
    const totalItems = Object.values(this.artworksByCategory).reduce((acc, arr) => acc + arr.length, 0);
    console.log('Total items ready to render:', totalItems);
  }

  hasArtworks(): boolean {
    return Object.values(this.artworksByCategory).some(arr => arr.length > 0);
  }

  addToCart(artwork: Artwork) {
    this.cartService.addToCart(artwork);
    console.log('Added to cart:', artwork);
    // TODO: Replace with a nicer toast notification
    alert(`Added "${artwork.title}" to cart!`);
  }
}
