import { Component, Inject, PLATFORM_ID, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '../../../app/services/cart.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CartSidebarComponent } from '../../cart-sidebar/cart-sidebar.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-marketplace-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CartSidebarComponent, ReactiveFormsModule],
  templateUrl: './marketplace-navbar.html',
  styleUrls: ['./marketplace-navbar.css']
})
export class MarketplaceNavbarComponent implements OnInit, OnDestroy {

  @Output() search = new EventEmitter<string>();
  searchControl = new FormControl('');
  cartCount$: Observable<number>;
  isProfileOpen = false; // 👈 dropdown state
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.cartCount$ = this.cartService.cartCount$;
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.search.emit(value || '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleCart() {
    this.cartService.toggleCart();
  }

  /* =========================
     Dropdown Controls
     ========================= */

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeProfile() {
    this.isProfileOpen = false;
  }

  /* =========================
     Navigation & Auth
     ========================= */

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      this.cartService.resetLocalState();
    }

    this.closeProfile(); // close dropdown on logout
    this.router.navigate(['/login']);
  }

  navigateToSellArt() {
    this.closeProfile();
    this.router.navigate(['/artist-onboarding']);
  }

  navigateToHome() {
    this.closeProfile();
    this.router.navigate(['/']);
  }
}
