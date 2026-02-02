import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Artwork } from '../models/artwork.model';
import { Cart, CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItems.asObservable();
  
  private cartCount = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCount.asObservable();

  private isCartOpen = new BehaviorSubject<boolean>(false);
  public isCartOpen$ = this.isCartOpen.asObservable();
  
  private cartTotal = new BehaviorSubject<number>(0);
  public cartTotal$ = this.cartTotal.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadCart();
  }

  toggleCart() {
    this.isCartOpen.next(!this.isCartOpen.value);
  }

  openCart() {
    this.isCartOpen.next(true);
  }

  closeCart() {
    this.isCartOpen.next(false);
  }

  loadCart() {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('CartService: No auth token found, skipping loadCart');
        return;
      }

      console.log('CartService: Loading cart...');
      this.http.get<Cart>(this.apiUrl).subscribe({
        next: (cart) => {
            console.log('CartService: Cart loaded successfully', cart);
            this.cartItems.next(cart.items);
            this.updateState(cart.items, cart.total_amount);
        },
        error: (err) => {
            console.error('CartService: Failed to load cart', err);
            // If 404 or empty, reset
            this.cartItems.next([]);
            this.cartCount.next(0);
            this.cartTotal.next(0);
        }
      });
    }
  }

  private updateState(items: CartItem[], total: number) {
      const count = items.reduce((acc, item) => acc + item.quantity, 0);
      console.log('CartService: Updating state. Count:', count, 'Total:', total);
      this.cartCount.next(count);
      this.cartTotal.next(total);
  }

  addToCart(artwork: Artwork, quantity: number = 1) {
    console.log('CartService: Adding to cart...', artwork.id);
    this.http.post(this.apiUrl, { artwork_id: artwork.id, quantity }, { responseType: 'text' }).subscribe({
        next: () => {
            console.log('CartService: Added to cart successfully. Reloading cart...');
            this.loadCart();
            this.openCart();
        },
        error: (err) => console.error('CartService: Failed to add to cart', err)
    });
  }

  updateQuantity(artworkId: string, quantity: number) {
    if (quantity < 1) return;
    this.http.put(`${this.apiUrl}/${artworkId}`, { quantity }, { responseType: 'text' }).subscribe({
        next: () => this.loadCart(),
        error: (err) => console.error('Failed to update quantity', err)
    });
  }

  removeFromCart(artworkId: string) {
    this.http.delete(`${this.apiUrl}/${artworkId}`, { responseType: 'text' }).subscribe({
        next: () => this.loadCart(),
        error: (err) => console.error('Failed to remove item', err)
    });
  }

  clearCart() {
    this.http.delete(this.apiUrl, { responseType: 'text' }).subscribe({
        next: () => {
            this.resetLocalState();
        },
        error: (err) => console.error('Failed to clear cart', err)
    });
  }

  resetLocalState() {
    this.cartItems.next([]);
    this.cartCount.next(0);
    this.cartTotal.next(0);
  }

  checkout(): Observable<any> {
      return this.http.post('http://localhost:8080/api/orders', {});
  }
}
