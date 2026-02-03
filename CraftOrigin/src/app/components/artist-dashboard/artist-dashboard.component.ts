import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-artist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './artist-dashboard.html',
  styleUrl: './artist-dashboard.css'
})
export class ArtistDashboardComponent {
  isSidebarOpen = false;

  menuItems = [
    { label: 'Overview', icon: 'layout-dashboard', route: '/artist/dashboard/overview' },
    { label: 'My Artworks', icon: 'palette', route: '/artist/dashboard/artworks' },
    { label: 'Orders', icon: 'shopping-bag', route: '/artist/dashboard/orders' },
    { label: 'Profile', icon: 'user', route: '/artist/dashboard/profile' },
    { label: 'Settings', icon: 'settings', route: '/artist/dashboard/settings' }
  ];

  constructor(
    public router: Router,
    private authService: AuthService
  ) {}

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
