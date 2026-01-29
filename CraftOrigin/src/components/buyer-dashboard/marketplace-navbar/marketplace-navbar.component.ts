import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CartService } from '../../../app/services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-marketplace-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './marketplace-navbar.html',
  styleUrls: ['./marketplace-navbar.css']
})
export class MarketplaceNavbarComponent {
  cartCount$: Observable<number>;

  constructor(
    private router: Router,
    private cartService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.cartCount$ = this.cartService.cartCount$;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user'); // If you store user info
    }
    // Redirect to login page
    this.router.navigate(['/login']);
  }

  navigateToSellArt() {
    this.router.navigate(['/sell-art']);
  }

  navigateToHome() {
      this.router.navigate(['/']);
  }
}
