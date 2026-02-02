import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile, Order, WishlistItem, Address } from './models';

@Injectable({ providedIn: 'root' })
export class BuyerService {
  private api = '/api/buyer';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.api}/profile`);
  }

  updateProfile(profile: Partial<Profile>): Observable<void> {
    return this.http.put<void>(`${this.api}/profile`, profile);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>('http://localhost:8080/api/orders');
  }

  getWishlist(): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.api}/wishlist`);
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.api}/addresses`);
  }

  // Add more methods as needed for add/edit/delete
}
