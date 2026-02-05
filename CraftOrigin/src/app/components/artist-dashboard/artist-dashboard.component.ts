import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { ArtistService, ArtistProfile } from '../../services/artist.service';

@Component({
  selector: 'app-artist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './artist-dashboard.html',
  styleUrl: './artist-dashboard.css'
})
export class ArtistDashboardComponent implements OnInit {
  isSidebarOpen = false;
  isVerificationPending = false;

  menuItems = [
    { label: 'Overview', icon: 'layout-dashboard', route: '/artist/dashboard/overview' },
    { label: 'My Artworks', icon: 'palette', route: '/artist/dashboard/artworks' },
    { label: 'Orders', icon: 'shopping-bag', route: '/artist/dashboard/orders' },
    { label: 'Profile', icon: 'user', route: '/artist/dashboard/profile' },
    { label: 'Settings', icon: 'settings', route: '/artist/dashboard/settings' }
  ];

  constructor(
    public router: Router,
    private authService: AuthService,
    private artistService: ArtistService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkVerificationStatus();
    }
  }

  checkVerificationStatus() {
    this.artistService.getProfile().subscribe({
      next: (profile: ArtistProfile) => {
        if (profile.verification_status === 'PENDING' || profile.verification_status === 'REJECTED') {
          this.isVerificationPending = true;
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch artist profile', err);
      }
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
