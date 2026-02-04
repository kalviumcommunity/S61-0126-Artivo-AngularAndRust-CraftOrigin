import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import type {
  AdminDashboardResponse,
  ArtistProfile,
  UserListDto,
  ArtworkResponse,
  Order,
  RevenueReportItem
} from './models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  // Use environment.apiUrl if available, otherwise fallback (assuming proxy or relative)
  // But typically environment is not imported in this file structure, so I'll assume /api relative path or hardcode base
  private apiUrl = 'http://localhost:8080/admin'; 

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.apiUrl}/dashboard`);
  }

  getPendingArtists(): Observable<ArtistProfile[]> {
    return this.http.get<ArtistProfile[]>(`${this.apiUrl}/artists/pending`);
  }

  verifyArtist(id: string, status: 'VERIFIED' | 'REJECTED'): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/artists/${id}/verify`, { status });
  }

  getUsers(page: number = 1, limit: number = 20, search: string = '', role: string = ''): Observable<UserListDto[]> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);

    return this.http.get<UserListDto[]>(`${this.apiUrl}/users`, { params });
  }

  updateUserStatus(id: string, active: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/users/${id}/status`, { active });
  }

  getArtworks(page: number = 1, limit: number = 20, search: string = '', active?: boolean): Observable<ArtworkResponse[]> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (search) params = params.set('search', search);
    if (active !== undefined) params = params.set('active', active);

    return this.http.get<ArtworkResponse[]>(`${this.apiUrl}/artworks`, { params });
  }

  updateArtworkStatus(id: string, active: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/artworks/${id}/status`, { active });
  }

  getOrders(page: number = 1, limit: number = 20, status: string = ''): Observable<Order[]> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (status) params = params.set('status', status);

    return this.http.get<Order[]>(`${this.apiUrl}/orders`, { params });
  }

  getRevenueReport(groupBy: 'period' | 'artist' | 'category' = 'period', startDate?: string, endDate?: string): Observable<RevenueReportItem[]> {
    let params = new HttpParams().set('group_by', groupBy);
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);

    return this.http.get<RevenueReportItem[]>(`${this.apiUrl}/reports/revenue`, { params });
  }
}
