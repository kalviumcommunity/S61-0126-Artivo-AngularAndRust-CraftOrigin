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
  uploadImage(artworkId: string, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post(`${this.apiUrl}/${artworkId}/image`, formData).pipe(
      catchError((error) => {
        console.error('Error uploading image:', error);
        throw error;
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
