import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Users, FileCheck, Settings, LogOut, Menu } from 'lucide-angular';
import { AuthService } from '../../app/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  isSidebarOpen = false;
  
  menuItems = [
    { label: 'Dashboard', route: '/admin/logs', icon: LayoutDashboard },
    { label: 'Users', route: '/admin/permissions', icon: Users },
    { label: 'Verification', route: '/admin/verification', icon: FileCheck },
    { label: 'Settings', route: '/admin/settings', icon: Settings }
  ];

  readonly icons = { LogOut, Menu };

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
