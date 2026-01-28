import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { Artwork } from '../models/artwork.model';

@Injectable({
  providedIn: 'root'
})
export class ArtworkService {
  private apiUrl: string = 'http://localhost:8080/api/artworks';

  constructor(private http: HttpClient) {}

  // Create a new artwork
  createArtwork(artwork: Artwork): Observable<Artwork> {
    return this.http.post<Artwork>(this.apiUrl, artwork).pipe(
      catchError((error) => {
        console.error('Error creating artwork:', error);
        // For development, you can return a mock response
        throw error;
      })
    );
  }

  // Upload artwork image
  uploadImage(imageFile: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post<{ url: string }>('http://localhost:8080/api/upload', formData).pipe(
      catchError((error) => {
        console.error('Error uploading image:', error);
        throw error;
      })
    );
  }

  // Get all artworks with pagination and filtering
  getArtworks(params: {
    page?: number;
    limit?: number;
    category?: string;
    min_price?: number;
    max_price?: number;
    artist_id?: string;
  } = {}): Observable<{ data: Artwork[]; total?: number; page?: number; total_pages?: number } | Artwork[]> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.limit !== undefined) httpParams = httpParams.set('limit', String(params.limit));
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.min_price !== undefined) httpParams = httpParams.set('min_price', String(params.min_price));
    if (params.max_price !== undefined) httpParams = httpParams.set('max_price', String(params.max_price));
    if (params.artist_id) httpParams = httpParams.set('artist_id', params.artist_id);

    return this.http.get<{ data: Artwork[]; total?: number; page?: number; total_pages?: number } | Artwork[]>(this.apiUrl, { params: httpParams }).pipe(
      catchError((error) => {
        console.error('Error fetching artworks:', error);
        return of({ data: [], total: 0, page: 1, total_pages: 0 });
      })
    );
  }

  // Get artworks by artist
  getArtworksByArtist(artistId: string): Observable<Artwork[]> {
    return this.http.get<Artwork[]>(`${this.apiUrl}/artist/${artistId}`).pipe(
      catchError((error) => {
        console.error('Error fetching artworks:', error);
        return of([]);
      })
    );
  }
}
