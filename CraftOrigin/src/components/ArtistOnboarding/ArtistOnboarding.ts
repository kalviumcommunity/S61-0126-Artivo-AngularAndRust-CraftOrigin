import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-artist-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ArtistOnboarding.html',
  styleUrl: './ArtistOnboarding.css'
})
export class ArtistOnboardingComponent {
  currentStep = 1;
  
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

  constructor(private router: Router) {}

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
        return !!(this.formData.artForm && this.formData.yearsOfExperience);
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
      // Here you would typically send the data to your backend API
      console.log('Submitting application:', this.formData);
      
      this.currentStep = 6;
      this.verificationStatus = {
        personalInfo: 'verified',
        documents: 'pending',
        artSamples: 'pending',
        bankDetails: 'verified',
      };
    } else {
      alert('Please complete all required bank details');
    }
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}