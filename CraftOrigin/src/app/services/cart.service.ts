import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Artwork } from '../models/artwork.model';

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItems.asObservable();
  
  private cartCount = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCount.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadCart();
  }

  private loadCart() {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const items: CartItem[] = JSON.parse(savedCart);
          this.cartItems.next(items);
          this.updateCount(items);
        } catch (e) {
          console.error('Failed to parse cart from local storage', e);
          this.cartItems.next([]);
        }
      }
    }
  }

  private saveCart(items: CartItem[]) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
    this.cartItems.next(items);
    this.updateCount(items);
  }

  private updateCount(items: CartItem[]) {
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    this.cartCount.next(count);
  }

  addToCart(artwork: Artwork) {
    const currentItems = this.cartItems.value;
    const existingItem = currentItems.find(item => item.artwork.id === artwork.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.saveCart([...currentItems]);
    } else {
      this.saveCart([...currentItems, { artwork, quantity: 1 }]);
    }
  }

  removeFromCart(artworkId: string) {
    const currentItems = this.cartItems.value.filter(item => item.artwork.id !== artworkId);
    this.saveCart(currentItems);
  }

  clearCart() {
    this.saveCart([]);
  }

  getCartItems(): CartItem[] {
    return this.cartItems.value;
  }
}
