import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';
import type { AdminPermission } from '../models';

@Component({
  selector: 'app-admin-permissions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
  permissions: AdminPermission[] = [];
  loading = true;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getPermissions().subscribe({
      next: (list) => {
        this.permissions = list;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
