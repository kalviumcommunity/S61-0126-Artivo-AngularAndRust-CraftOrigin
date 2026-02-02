import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BuyerService } from '../buyer.service';
import { Profile, Order } from '../models';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-buyer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class BuyerProfileComponent implements OnInit {
  profileForm: any;
  loading = true;
  saving = false;
  error = '';
  success = '';
  orders: Order[] = [];
  ordersLoading = true;
  /** true = show profile, false = show orders */
  showProfile = true;

  constructor(
    private buyerService: BuyerService,
    private router: Router,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.profileForm = this.fb.group({
      name: [''],
      email: [''],
      phone: ['']
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const user = JSON.parse(stored) as { name?: string; email?: string };
          this.profileForm.patchValue({ name: user.name ?? '', email: user.email ?? '' });
          this.loading = false;
        } catch {}
      }
      this.buyerService.getProfile().subscribe({
        next: (profile: Profile) => {
          this.profileForm.patchValue(profile);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
      this.buyerService.getOrders().subscribe({
        next: (list) => {
          this.orders = list ?? [];
          this.ordersLoading = false;
        },
        error: () => {
          this.orders = [];
          this.ordersLoading = false;
        }
      });
    } else {
      this.loading = false;
      this.ordersLoading = false;
    }
  }

  back() {
    this.router.navigate(['/marketplace']);
  }

  showOrdersView() {
    this.showProfile = false;
  }

  showProfileView() {
    this.showProfile = true;
  }

  save() {
    this.success = '';
    this.error = '';
    this.saving = true;
    // Fix type error: cast value to Profile, filter out nulls
    const value = this.profileForm.value;
    const cleanValue = {
      name: value.name ?? '',
      email: value.email ?? '',
      phone: value.phone ?? undefined
    };
    this.buyerService.updateProfile(cleanValue).subscribe({
      next: () => {
        this.success = 'Profile updated.';
        this.saving = false;
      },
      error: () => {
        this.error = 'Failed to update profile.';
        this.saving = false;
      }
    });
  }
}
