import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BuyerService } from '../buyer.service';
import type { Profile } from '../models';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-header.html',
  styleUrls: ['./dashboard-header.css']
})
export class DashboardHeaderComponent implements OnInit {
  displayName = 'User';

  constructor(
    private buyerService: BuyerService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const user = JSON.parse(stored) as { name?: string; email?: string };
          if (user?.name) {
            this.displayName = user.name;
            return;
          }
        } catch {}
      }
      this.buyerService.getProfile().subscribe({
        next: (profile: Profile) => {
          this.displayName = profile?.name || 'User';
        },
        error: () => {
          this.displayName = this.displayName || 'User';
        }
      });
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    }
  }
}
