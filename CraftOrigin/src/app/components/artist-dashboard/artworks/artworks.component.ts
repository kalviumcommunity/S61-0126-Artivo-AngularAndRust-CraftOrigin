import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArtistService } from '../../../services/artist.service';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-artist-artworks',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './artworks.html',
  styleUrl: './artworks.css'
})
export class ArtistArtworksComponent implements OnInit {
  artworks: any[] = [];
  isLoading = true;
  searchQuery = '';
  filterStatus = 'all'; // all, active, inactive

  constructor(
    private artistService: ArtistService, 
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadArtworks();
    } else {
      this.isLoading = false;
    }
  }

  loadArtworks() {
    this.isLoading = true;
    const params: any = {};
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.filterStatus !== 'all') params.active = this.filterStatus === 'active';

    this.artistService.getMyArtworks(params).subscribe({
      next: (data) => {
        this.artworks = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load artworks', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    this.loadArtworks();
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path}`;
  }

  toggleStatus(artwork: any) {
    this.artistService.toggleArtworkStatus(artwork.id).subscribe({
      next: (updated) => {
        artwork.active = updated.active;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to toggle status', err);
        alert('Failed to update status');
        this.cdr.detectChanges();
      }
    });
  }
  
  deleteArtwork(id: string) {
      if(confirm('Are you sure you want to delete this artwork?')) {
          this.artistService.deleteArtwork(id).subscribe({
              next: () => {
                  this.artworks = this.artworks.filter(a => a.id !== id);
                  this.cdr.detectChanges();
              },
              error: (err) => {
                  console.error('Failed to delete artwork', err);
                  alert('Failed to delete artwork: ' + (err.error?.message || 'Unknown error'));
                  this.cdr.detectChanges();
              }
          });
      }
  }
}
