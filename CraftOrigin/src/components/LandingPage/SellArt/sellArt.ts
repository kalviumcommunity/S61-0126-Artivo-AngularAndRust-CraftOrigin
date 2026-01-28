import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArtworkService } from '../../../app/services/artwork.service';
import { ARTWORK_CATEGORIES } from '../../../app/models/artwork.model';
import { FooterComponent } from '../Footer/footer.component';

@Component({
  selector: 'app-sell-art',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FooterComponent],
  templateUrl: './sellArt.html',
  styleUrl: './sellArt.css'
})
export class SellArtComponent implements OnInit {
  sellArtForm: FormGroup;
  categories = ARTWORK_CATEGORIES;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private artworkService: ArtworkService,
    private router: Router
  ) {
    this.sellArtForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      category: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity_available: ['', [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      authenticity_ref: ['', [Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    // Form is initialized in constructor
    // You can add authentication check here if needed
    // For now, allowing all users to see the form
  }

  // Handle image selection
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  // Remove selected image
  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    const input = document.getElementById('image') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  }

  // Get form controls for easy access
  get title() { return this.sellArtForm.get('title'); }
  get description() { return this.sellArtForm.get('description'); }
  get category() { return this.sellArtForm.get('category'); }
  get price() { return this.sellArtForm.get('price'); }
  get quantity_available() { return this.sellArtForm.get('quantity_available'); }
  get authenticity_ref() { return this.sellArtForm.get('authenticity_ref'); }

  // Handle form submission
  onSubmit(): void {
    if (this.sellArtForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.sellArtForm.controls).forEach(key => {
        this.sellArtForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    // Get user ID from localStorage (in real app, use auth service)
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const artistId = user?.id || 'temp-artist-id'; // Replace with actual artist ID

    const createArtworkWithImage = (imageUrl?: string) => {
      // Prepare artwork data
      const artworkData = {
        artist_id: artistId,
        title: this.sellArtForm.value.title,
        description: this.sellArtForm.value.description,
        category: this.sellArtForm.value.category,
        price: parseFloat(this.sellArtForm.value.price),
        quantity_available: parseInt(this.sellArtForm.value.quantity_available),
        authenticity_ref: this.sellArtForm.value.authenticity_ref || '',
        image_url: imageUrl || '',
        active: true
      };

      // Submit artwork
      this.artworkService.createArtwork(artworkData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.sellArtForm.reset();
          this.removeImage();
          
          // Reset form after 3 seconds
          setTimeout(() => {
            this.submitSuccess = false;
          }, 3000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitError = error.error?.message || 'Failed to create artwork. Please try again.';
          console.error('Error creating artwork:', error);
        }
      });
    };

    if (this.selectedImage) {
      this.artworkService.uploadImage(this.selectedImage).subscribe({
        next: (response) => {
          createArtworkWithImage(response.url);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitError = 'Image upload failed. Please try again.';
          console.error('Image upload error:', error);
        }
      });
    } else {
      createArtworkWithImage();
    }
  }

  // Navigate back to home
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
