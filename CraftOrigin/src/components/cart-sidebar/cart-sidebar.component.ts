import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../app/services/cart.service';
import { LucideAngularModule } from 'lucide-angular';
import { Observable, Subscription, map } from 'rxjs';
import { Router } from '@angular/router';

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
    private router: Router
  ) {
    this.cartItems$ = this.cartService.cartItems$;
    
    // Calculate subtotal
    this.subtotal$ = this.cartItems$.pipe(
      map(items => items.reduce((sum, item) => sum + (item.artwork.price * item.quantity), 0))
    );
  }

  ngOnInit() {
    this.sub.add(
      this.cartService.isCartOpen$.subscribe(isOpen => {
        this.isOpen = isOpen;
        if (isOpen) {
          // Prevent body scroll when cart is open
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'auto';
        }
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    document.body.style.overflow = 'auto';
  }

  close() {
    this.cartService.closeCart();
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;
    
    // We need a way to update quantity in CartService without adding/removing one by one?
    // Current CartService only has addToCart (adds 1) and removeFromCart (removes all).
    // Let's assume we can loop or we might need to update CartService to support setQuantity.
    // For now, if change is +1, call addToCart.
    // If change is -1, we need to handle it.
    // Ideally CartService should have updateQuantity method.
    
    if (change > 0) {
      this.cartService.addToCart(item.artwork);
    } else {
      if (item.artwork.id) {
        this.cartService.updateQuantity(item.artwork.id, newQuantity);
      }
    }
  }

  removeItem(item: CartItem) {
    if (item.artwork.id) {
      this.cartService.removeFromCart(item.artwork.id);
    }
  }

  checkout() {
    this.close();
    // Navigate to checkout or process order
    this.router.navigate(['/checkout']);
  }
}
