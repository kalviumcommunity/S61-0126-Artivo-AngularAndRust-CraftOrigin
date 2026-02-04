import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  isSidebarOpen = false;
  
  menuItems = [
    { label: 'Dashboard', route: '/admin/logs', icon: 'fa-chart-line' },
    { label: 'Users', route: '/admin/permissions', icon: 'fa-users' },
    { label: 'Verification', route: '/admin/verification', icon: 'fa-check-circle' },
    { label: 'Settings', route: '/admin/settings', icon: 'fa-cog' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  logout() {
    this.authService.logout();
  }
}
