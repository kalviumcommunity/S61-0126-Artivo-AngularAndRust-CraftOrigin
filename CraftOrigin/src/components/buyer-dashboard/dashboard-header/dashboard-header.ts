import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  user: Profile | null = null;

  constructor(
    private buyerService: BuyerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.buyerService.getProfile().subscribe({
        next: (profile) => {
          this.user = profile;
        },
        error: () => {
          this.user = { name: 'User', email: '' };
        }
      });
    }
  }
}
