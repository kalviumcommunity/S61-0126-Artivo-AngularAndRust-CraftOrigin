import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ArtistService, DashboardStats } from '../../../services/artist.service';
import { LucideAngularModule } from 'lucide-angular';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-artist-overview',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class ArtistOverviewComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;
  error: string | null = null;
  lastRefreshTime = 'Just now';

  constructor(
    private artistService: ArtistService, 
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadStats();
    } else {
      this.isLoading = false;
    }
  }

  loadStats() {
    this.isLoading = true;
    this.artistService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.lastRefreshTime = 'Just now';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load dashboard stats', err);
        this.error = 'Failed to load dashboard statistics';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
