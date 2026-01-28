import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyerService } from '../buyer.service';
import { Order } from '../models';

@Component({
  selector: 'app-buyer-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = '';

  constructor(private buyerService: BuyerService) {}

  ngOnInit() {
    this.buyerService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load orders.';
        this.loading = false;
      }
    });
  }
}
