import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../../app/services/artist.service';

@Component({
  selector: 'app-artist-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ArtistOnboarding.html',
  styleUrl: './ArtistOnboarding.css'
})
export class ArtistOnboardingComponent {
  currentStep = 1;
  isSubmitting = false;
  
  formData: any = {
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    artForm: '',
    tribe: '',
    yearsOfExperience: '',
    specialization: '',
    bio: '', // Added bio
    photo: null,
    idProof: null,
    artSamples: [],
    tribalCertificate: null,
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  };

  verificationStatus = {
    personalInfo: 'pending',
    documents: 'pending',
    artSamples: 'pending',
    bankDetails: 'pending',
  };

  artForms = [
    'Warli Painting', 'Gond Art', 'Madhubani', 'Pottery', 'Handloom Weaving',
    'Tribal Jewelry', 'Wood Carving', 'Metal Craft', 'Terracotta', 'Other'
  ];

  states = [
    'Maharashtra', 'Madhya Pradesh', 'Bihar', 'Odisha', 'Rajasthan',
    'Gujarat', 'Telangana', 'Andhra Pradesh', 'Tamil Nadu', 'Kerala'
  ];

  constructor(
    private router: Router,
    private artistService: ArtistService
  ) {}

  onFileSelect(event: any, field: string) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (field === 'artSamples') {
      const newSamples = [...this.formData.artSamples, ...Array.from(files)].slice(0, 5);
      this.formData.artSamples = newSamples;
    } else {
      this.formData[field] = files[0];
    }
  }

  removeArtSample(index: number) {
    this.formData.artSamples = this.formData.artSamples.filter((_: any, i: number) => i !== index);
  }

  validateStep(step: number): boolean {
    switch (step) {
      case 1:
        return !!(this.formData.fullName && this.formData.email && 
                 this.formData.phone && this.formData.dateOfBirth);
      case 2:
        return !!(this.formData.address && this.formData.state && this.formData.pincode);
      case 3:
        return !!(this.formData.artForm && this.formData.yearsOfExperience && this.formData.bio); // Added bio validation
      case 4:
        return !!(this.formData.photo && this.formData.idProof && 
                 this.formData.artSamples.length >= 3);
      case 5:
        return !!(this.formData.accountName && this.formData.accountNumber && 
                 this.formData.ifscCode);
      default:
        return false;
    }
  }

  nextStep() {
    if (this.validateStep(this.currentStep)) {
      this.currentStep = Math.min(this.currentStep + 1, 6);
    } else {
      alert('Please fill all required fields before proceeding');
    }
  }

  prevStep() {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  submitApplication() {
    if (this.validateStep(5)) {
      this.isSubmitting = true;
      
      const payload = {
        tribe_name: this.formData.tribe || this.formData.artForm, // Fallback if tribe empty
        region: this.formData.state,
        bio: this.formData.bio
      };

      this.artistService.registerArtist(payload).subscribe({
        next: (response) => {
          console.log('Application submitted:', response);
          
          // Force update user role in local storage
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user) {
            user.role = 'ARTIST';
            localStorage.setItem('user', JSON.stringify(user));
          }

          this.currentStep = 6;
          this.verificationStatus = {
            personalInfo: 'verified',
            documents: 'pending',
            artSamples: 'pending',
            bankDetails: 'verified',
          };
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Submission error:', err);
          if (err.status === 409) {
             // Handle "Artist profile already exists"
             // Assuming success if already exists for now, or could show specific error
             alert('You are already registered as an artist.');
             this.goToDashboard();
          } else {
             alert('Failed to submit application: ' + (err.error?.message || 'Unknown error'));
          }
          this.isSubmitting = false;
        }
      });
    } else {
      alert('Please complete all required bank details');
    }
  }

  goToDashboard() {
    this.router.navigate(['/artist/dashboard']).then(() => {
      window.location.reload(); // Reload to ensure auth state is fresh
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}