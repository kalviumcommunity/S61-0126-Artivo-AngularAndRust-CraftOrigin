import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyerService } from '../buyer.service';
import { Profile } from '../models';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-buyer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class BuyerProfileComponent implements OnInit {
  profileForm: any;
  loading = true;
  error = '';
  success = '';

  constructor(private buyerService: BuyerService, private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: [''],
      email: [''],
      phone: ['']
    });
  }

  ngOnInit() {
    this.buyerService.getProfile().subscribe({
      next: (profile: Profile) => {
        this.profileForm.patchValue(profile);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load profile.';
        this.loading = false;
      }
    });
  }

  save() {
    this.success = '';
    this.error = '';
    this.loading = true;
    // Fix type error: cast value to Profile, filter out nulls
    const value = this.profileForm.value;
    const cleanValue = {
      name: value.name ?? '',
      email: value.email ?? '',
      phone: value.phone ?? undefined
    };
    this.buyerService.updateProfile(cleanValue).subscribe({
      next: () => {
        this.success = 'Profile updated!';
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to update profile.';
        this.loading = false;
      }
    });
  }
  }
