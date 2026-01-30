import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '../../../app/services/cart.service';
import { Observable } from 'rxjs';
import { CartSidebarComponent } from '../../cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-marketplace-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CartSidebarComponent],
  templateUrl: './marketplace-navbar.html',
  styleUrls: ['./marketplace-navbar.css']
})
export class MarketplaceNavbarComponent {

  cartCount$: Observable<number>;
  isProfileOpen = false; // 👈 dropdown state

  constructor(
    private router: Router,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.cartCount$ = this.cartService.cartCount$;
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
      this.cartService.clearCart();
    }

    this.closeProfile(); // close dropdown on logout
    this.router.navigate(['/login']);
  }

  navigateToSellArt() {
    this.closeProfile();
    this.router.navigate(['/sell-art']);
  }

  navigateToHome() {
    this.closeProfile();
    this.router.navigate(['/']);
  }
}
