import { Component, OnInit, OnDestroy, ChangeDetectorRef, Inject, PLATFORM_ID, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtworkService } from '../../../app/services/artwork.service';
import { Artwork, ARTWORK_CATEGORIES } from '../../../app/models/artwork.model';
import { LucideAngularModule } from 'lucide-angular';
import { MarketplaceNavbarComponent } from '../marketplace-navbar/marketplace-navbar.component';
import { CartService } from '../../../app/services/cart.service';
import { ToastService } from '../../../app/services/toast.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, throttleTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-marketplace-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, MarketplaceNavbarComponent, ReactiveFormsModule],
  templateUrl: './marketplace-feed.html',
  styleUrls: ['./marketplace-feed.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceFeedComponent implements OnInit, OnDestroy {
  categories: string[] = [...ARTWORK_CATEGORIES]; // Create a mutable copy with string[] type
  artworksByCategory: { [key: string]: Artwork[] } = {};
  selectedCategory: string | null = null;
  isLoading = true;
  error: string | null = null;
  searchControl = new FormControl('', { nonNullable: true });
  currentLimit = 12;
  private allArtworks: Artwork[] = [];
  private addToCartClicks$ = new Subject<Artwork>();
  private destroy$ = new Subject<void>();

  constructor(
    private artworkService: ArtworkService,
    private cartService: CartService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onSearch(term: string) {
    this.searchControl.setValue(term);
  }

  trackByArtwork(index: number, artwork: Artwork): string {
    return artwork.id || index.toString();
  }

  trackByCategory(index: number, category: string): string {
    return category;
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return 'assets/placeholder-art.jpg';
    if (url.startsWith('http') || url.startsWith('assets/')) return url;
    return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.searchControl.valueChanges
        .pipe(debounceTime(350), distinctUntilChanged(), takeUntil(this.destroy$))
        .subscribe((term) => this.applyFilter(term));

      this.addToCartClicks$
        .pipe(throttleTime(1000), takeUntil(this.destroy$))
        .subscribe((artwork) => this.addToCart(artwork));

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
        this.allArtworks = artworks;
        this.applyFilter(this.searchControl.value);
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
    
    // Initialize standard categories
    this.categories.forEach(cat => {
      this.artworksByCategory[cat] = [];
    });
    
    // Ensure 'Other' exists
    if (!this.artworksByCategory['Other']) {
        this.artworksByCategory['Other'] = [];
    }

    // Distribute artworks
    artworks.forEach(art => {
      const categoryRaw = art.category ? art.category.trim() : 'Other';
      
      // 1. Try exact match (case-sensitive)
      if (this.artworksByCategory[categoryRaw]) {
        this.artworksByCategory[categoryRaw].push(art);
        return;
      }
      
      // 2. Try case-insensitive match against existing categories
      const matchingCat = this.categories.find(c => c.toLowerCase() === categoryRaw.toLowerCase());
      if (matchingCat) {
        this.artworksByCategory[matchingCat].push(art);
        return;
      }

      // 3. If no match, check if it's a known variation or partial match? 
      // Actually, if it's a valid category from backend that isn't in our static list, 
      // we should probably add it dynamically so it gets its own section.
      
      // Add new category dynamically
      this.categories.push(categoryRaw);
      this.artworksByCategory[categoryRaw] = [art];
    });
    
    // Clean up empty categories to avoid clutter (optional, but good for UI)
    // this.categories = this.categories.filter(c => this.artworksByCategory[c]?.length > 0);
    
    console.log('Grouped artworks:', this.artworksByCategory);
  }

  hasArtworks(): boolean {
    return Object.values(this.artworksByCategory).some(arr => arr.length > 0);
  }

  queueAddToCart(artwork: Artwork) {
    this.addToCartClicks$.next(artwork);
  }

  addToCart(artwork: Artwork) {
    this.cartService.addToCart(artwork);
    console.log('Added to cart:', artwork);
    this.toastService.show(`Added "${artwork.title}" to cart!`, 'success');
  }

  applyFilter(term: string) {
    const query = term.trim().toLowerCase();
    
    // Reset selected category when searching to show all results
    if (this.selectedCategory) {
      this.selectedCategory = null;
    }

    if (!query) {
      this.groupArtworks(this.allArtworks);
      return;
    }

    const filtered = this.allArtworks.filter((art) => {
      const title = art.title?.toLowerCase() ?? '';
      const description = art.description?.toLowerCase() ?? '';
      const category = art.category?.toLowerCase() ?? '';
      return title.includes(query) || description.includes(query) || category.includes(query);
    });

    this.groupArtworks(filtered);
  }

  viewCategory(category: string) {
    this.selectedCategory = category;
    this.currentLimit = 12;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToOverview() {
    this.selectedCategory = null;
    this.currentLimit = 12;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadMore() {
    this.currentLimit += 12;
  }

  scrollContainer(container: HTMLElement, direction: 'left' | 'right') {
    const scrollAmount = 320; // card width + gap approx
    const currentScroll = container.scrollLeft;
    
    container.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
