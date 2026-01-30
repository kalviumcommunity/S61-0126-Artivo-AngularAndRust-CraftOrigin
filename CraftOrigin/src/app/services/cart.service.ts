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

  private isCartOpen = new BehaviorSubject<boolean>(false);
  public isCartOpen$ = this.isCartOpen.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
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

  updateQuantity(artworkId: string, quantity: number) {
    const currentItems = this.cartItems.value;
    const item = currentItems.find(item => item.artwork.id === artworkId);
    if (item) {
      item.quantity = quantity;
      this.saveCart([...currentItems]);
    }
  }

  clearCart() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('cart');
    }
    this.cartItems.next([]);
    this.cartCount.next(0);
  }

  getCartItems(): CartItem[] {
    return this.cartItems.value;
  }
}
