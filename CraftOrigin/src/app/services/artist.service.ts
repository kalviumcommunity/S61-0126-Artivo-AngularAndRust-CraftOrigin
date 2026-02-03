import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface ArtistProfile {
  id: string;
  user_id: string;
  tribe_name: string;
  region: string;
  bio?: string;
  verification_status: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_artworks: number;
  active_artworks: number;
  total_sales: number;
  total_revenue: number;
  pending_orders: number;
  sales_trend: { month?: string; sales?: number; revenue?: number }[];
  top_artworks: { id: string; title: string; total_sold: number; revenue: number }[];
  recent_orders: { id: string; buyer_name: string; total_amount: number; status: string; placed_at: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ArtistService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  registerArtist(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/artists/register`, data);
  }

  getProfile(): Observable<ArtistProfile> {
    return this.http.get<ArtistProfile>(`${this.apiUrl}/api/artists/me`);
  }

  updateProfile(data: Partial<ArtistProfile>): Observable<ArtistProfile> {
    return this.http.patch<ArtistProfile>(`${this.apiUrl}/api/artists/me`, data);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/api/artists/me/dashboard`).pipe(
      catchError((error: any) => {
        console.error('Error fetching dashboard stats:', error);
        return throwError(() => error);
      })
    );
  }

  createArtwork(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/artists/me/artworks`, data);
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/api/upload`, formData);
  }

  getMyArtworks(query: any = {}): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/artists/me/artworks`, { params: query });
  }

  getOrders(query: any = {}): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/artists/me/orders`, { params: query });
  }

  getOrderDetail(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/artists/me/orders/${id}`);
  }

  toggleArtworkStatus(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/artworks/${id}/toggle-active`, {});
  }

  deleteArtwork(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/artworks/${id}`);
  }

  updateOrderItemStatus(itemId: string, status: string, trackingNumber?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/artists/me/order-items/${itemId}/status`, {
      status,
      tracking_number: trackingNumber
    });
  }
}
