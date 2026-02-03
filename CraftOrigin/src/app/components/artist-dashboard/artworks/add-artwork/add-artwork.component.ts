import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../../../../services/artist.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-add-artwork',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './add-artwork.html',
  styleUrl: './add-artwork.css'
})
export class AddArtworkComponent {
  formData: any = {
    title: '',
    description: '',
    price: null,
    category: '',
    quantity: 1,
    image_url: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;

  categories = ['Painting', 'Sculpture', 'Textile', 'Jewelry', 'Pottery', 'Woodwork', 'Other'];

  constructor(
    private artistService: ArtistService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (!this.isValid()) return;
    
    this.isSubmitting = true;
    this.cdr.detectChanges();

    // Step 1: Upload Image (if selected)
    if (this.selectedFile) {
      this.artistService.uploadImage(this.selectedFile).subscribe({
        next: (response) => {
          this.formData.image_url = response.url; // Backend returns { url: "..." }
          this.createArtwork();
        },
        error: (err) => {
          console.error('Image upload failed', err);
          alert('Failed to upload image');
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      // Proceed without image (or use existing if editing)
      this.createArtwork();
    }
  }

  createArtwork() {
    // Convert price/quantity to numbers
    const payload = {
      title: this.formData.title,
      description: this.formData.description,
      category: this.formData.category,
      price: parseFloat(this.formData.price),
      quantity_available: parseInt(this.formData.quantity),
      image_url: this.formData.image_url
    };

    this.artistService.createArtwork(payload).subscribe({
      next: () => {
        alert('Artwork created successfully!');
        this.router.navigate(['/artist/dashboard/artworks']);
      },
      error: (err) => {
        console.error('Failed to create artwork', err);
        alert('Failed to create artwork: ' + (err.error?.message || 'Unknown error'));
        this.isSubmitting = false;
      }
    });
  }

  isValid(): boolean {
    return this.formData.title && 
           this.formData.description && 
           this.formData.price && 
           this.formData.category && 
           this.formData.quantity > 0;
  }
  
  cancel() {
      this.router.navigate(['/artist/dashboard/artworks']);
  }
}
