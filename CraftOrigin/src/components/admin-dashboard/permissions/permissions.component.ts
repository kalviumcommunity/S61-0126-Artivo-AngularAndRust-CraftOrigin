import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';
import type { UserListDto } from '../models';

@Component({
  selector: 'app-admin-permissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
  users: UserListDto[] = [];
  loading = true;
  processingId: string | null = null;
  errorMsg: string | null = null;

  constructor(private admin: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMsg = null;
    // Default params for now
    this.admin.getUsers().subscribe({
      next: (list) => {
        this.users = list;
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('Failed to load users', err);
        const status = err.status ? ` (Status: ${err.status})` : '';
        const message = err.message || 'Unknown error';
        this.errorMsg = `Failed to load users: ${message}${status}. Please try again.`;
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      }
    });
  }

  toggleStatus(user: UserListDto): void {
    if (user.role === 'ADMIN') return; // Prevent disabling admins for safety
    
    this.processingId = user.id;
    const newStatus = !user.active;
    
    this.admin.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        user.active = newStatus;
        this.processingId = null;
      },
      error: () => (this.processingId = null)
    });
  }
}
