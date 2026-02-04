import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import type { ArtistProfile } from '../models';

@Component({
  selector: 'app-admin-verification-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification-requests.component.html',
  styleUrls: ['./verification-requests.component.css']
})
export class VerificationRequestsComponent implements OnInit {
  requests: ArtistProfile[] = [];
  loading = true;
  processingId: string | null = null;
  
  constructor(private admin: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.admin.getPendingArtists().subscribe({
      next: (list) => {
        this.requests = list;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  verify(artist: ArtistProfile, status: 'VERIFIED' | 'REJECTED'): void {
    this.processingId = artist.id;
    this.admin.verifyArtist(artist.id, status).subscribe({
      next: () => {
        this.processingId = null;
        this.load();
      },
      error: () => {
        this.processingId = null;
        this.cdr.detectChanges();
      }
    });
  }
}
