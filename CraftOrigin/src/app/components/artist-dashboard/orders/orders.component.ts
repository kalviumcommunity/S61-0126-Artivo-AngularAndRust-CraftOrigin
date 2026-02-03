import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArtistService } from '../../../services/artist.service';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-artist-orders',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class ArtistOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;
  filterStatus = 'all'; // all, PLACED, PROCESSING, SHIPPED, DELIVERED
  
  // For status updates
  selectedItem: any = null;
  trackingNumber = '';
  showStatusModal = false;
  newStatus = '';

  constructor(
    private artistService: ArtistService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    const params: any = {};
    if (this.filterStatus !== 'all') params.status = this.filterStatus;

    this.artistService.getOrders(params).subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange() {
    this.loadOrders();
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path}`;
  }

  // Helper to get allowed next status
  getNextStatus(currentStatus: string): string | null {
    switch (currentStatus) {
      case 'PLACED': return 'PROCESSING';
      case 'PROCESSING': return 'SHIPPED';
      case 'SHIPPED': return 'DELIVERED';
      default: return null;
    }
  }

  openStatusModal(item: any) {
    const next = this.getNextStatus(item.status);
    if (!next) return;

    this.selectedItem = item;
    this.newStatus = next;
    this.trackingNumber = '';
    this.showStatusModal = true;
  }

  closeStatusModal() {
    this.showStatusModal = false;
    this.selectedItem = null;
    this.trackingNumber = '';
  }

  updateStatus() {
    if (!this.selectedItem) return;
    
    if (this.newStatus === 'SHIPPED' && !this.trackingNumber) {
      alert('Tracking number is required for shipping.');
      return;
    }

    this.artistService.updateOrderItemStatus(
      this.selectedItem.id, 
      this.newStatus, 
      this.newStatus === 'SHIPPED' ? this.trackingNumber : undefined
    ).subscribe({
      next: () => {
        // Update local state
        this.selectedItem.status = this.newStatus;
        this.closeStatusModal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update status', err);
        alert('Failed to update status');
        this.cdr.detectChanges();
      }
    });
  }
}
