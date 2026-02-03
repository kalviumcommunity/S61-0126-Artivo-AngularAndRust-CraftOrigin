import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import type { ArtistVerificationRequest } from '../models';

@Component({
  selector: 'app-admin-verification-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-requests.component.html',
  styleUrls: ['./verification-requests.component.css']
})
export class VerificationRequestsComponent implements OnInit {
  requests: ArtistVerificationRequest[] = [];
  loading = true;
  processingId: string | null = null;
  reviewNotes: Record<string, string> = {};

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.admin.getVerificationRequests().subscribe({
      next: (list) => {
        this.requests = list;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  approve(req: ArtistVerificationRequest): void {
    this.processingId = req.id;
    const notes = this.reviewNotes[req.id];
    this.admin.approveVerification(req.id, notes || undefined).subscribe({
      next: () => {
        this.processingId = null;
        this.load();
      },
      error: () => (this.processingId = null)
    });
  }

  reject(req: ArtistVerificationRequest): void {
    this.processingId = req.id;
    const notes = this.reviewNotes[req.id];
    this.admin.rejectVerification(req.id, notes || undefined).subscribe({
      next: () => {
        this.processingId = null;
        this.load();
      },
      error: () => (this.processingId = null)
    });
  }

  pendingOnly(): ArtistVerificationRequest[] {
    return this.requests.filter(r => r.status === 'PENDING');
  }
}
