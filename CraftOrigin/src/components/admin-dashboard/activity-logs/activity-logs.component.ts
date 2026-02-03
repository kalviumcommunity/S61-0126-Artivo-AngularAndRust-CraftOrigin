import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';
import type { AdminActivityLog } from '../models';

@Component({
  selector: 'app-admin-activity-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-logs.component.html',
  styleUrls: ['./activity-logs.component.css']
})
export class ActivityLogsComponent implements OnInit {
  logs: AdminActivityLog[] = [];
  loading = true;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getActivityLogs().subscribe({
      next: (list) => {
        this.logs = list;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }
}
