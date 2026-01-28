import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyerService } from '../buyer.service';
import { WishlistItem } from '../models';

@Component({
  selector: 'app-buyer-wishlist',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlist: WishlistItem[] = [];
  loading = true;
  error = '';

  constructor(private buyerService: BuyerService) {}

  ngOnInit() {
    this.buyerService.getWishlist().subscribe({
      next: (wishlist) => {
        this.wishlist = wishlist;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load wishlist.';
        this.loading = false;
      }
    });
  }
}
