import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService } from '../../app/services/cart.service';
import { CartItem } from '../../app/models/cart.model';
import { LucideAngularModule } from 'lucide-angular';
import { Observable, Subscription, map } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../../app/services/toast.service';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './cart-sidebar.html',
  styleUrls: ['./cart-sidebar.css']
})
export class CartSidebarComponent implements OnInit, OnDestroy {
  isOpen = false;
  cartItems$: Observable<CartItem[]>;
  subtotal$: Observable<number>;
  private sub = new Subscription();

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    this.subtotal$ = this.cartService.cartTotal$;
  }

  ngOnInit() {
    this.sub.add(
      this.cartService.isCartOpen$.subscribe(isOpen => {
        this.isOpen = isOpen;
        if (isPlatformBrowser(this.platformId)) {
          if (isOpen) {
            // Prevent body scroll when cart is open
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = 'auto';
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return 'assets/placeholder-art.jpg';
    if (url.startsWith('http') || url.startsWith('assets/')) return url;
    return `http://localhost:8080${url.startsWith('/') ? '' : '/'}${url}`;
  }

  close() {
    this.cartService.closeCart();
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;
    
    // Check if we have artwork_id (from backend model) or artwork.id (if using full artwork object)
    // The new CartItem interface uses flat structure with artwork_id
    const id = item.artwork_id; 
    if (id) {
        this.cartService.updateQuantity(id, newQuantity);
    }
  }

  removeItem(item: CartItem) {
    const id = item.artwork_id;
    if (id) {
      this.cartService.removeFromCart(id);
    }
  }

  placeOrder() {
    this.cartService.checkout().subscribe({
        next: (res) => {
            console.log('Order placed:', res);
            this.close();
            this.router.navigate(['/dashboard/orders']);
            this.toastService.show('Order placed successfully!', 'success');
        },
        error: (err) => {
            console.error('Order failed:', err);
            this.toastService.show('Failed to place order. ' + (err.error || ''), 'error');
        }
    });
  }
}
