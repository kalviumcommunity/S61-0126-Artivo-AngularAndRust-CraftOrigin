import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistService, ArtistProfile } from '../../../services/artist.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-artist-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ArtistProfileComponent implements OnInit {
  profile: ArtistProfile | null = null;
  isLoading = true;
  isSaving = false;
  isEditing = false;
  
  editForm: any = {
    tribe_name: '',
    region: '',
    bio: ''
  };

  constructor(
    private artistService: ArtistService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading = true;
    this.artistService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
        this.resetForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    if (this.profile) {
      this.editForm = {
        tribe_name: this.profile.tribe_name,
        region: this.profile.region,
        bio: this.profile.bio || ''
      };
    }
  }

  startEditing() {
    this.isEditing = true;
    this.resetForm();
  }

  cancelEditing() {
    this.isEditing = false;
    this.resetForm();
  }

  saveProfile() {
    this.isSaving = true;
    this.artistService.updateProfile(this.editForm).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.isEditing = false;
        this.isSaving = false;
        this.cdr.detectChanges();
        alert('Profile updated successfully');
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.isSaving = false;
        this.cdr.detectChanges();
        alert('Failed to update profile');
      }
    });
  }
}
