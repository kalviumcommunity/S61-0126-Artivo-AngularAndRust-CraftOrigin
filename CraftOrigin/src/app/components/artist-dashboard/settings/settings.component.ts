import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-artist-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p class="text-gray-500">Settings coming soon.</p>
        <p class="text-sm text-gray-400 mt-2">You can update your profile details in the Profile section.</p>
      </div>
    </div>
  `,
  styles: []
})
export class ArtistSettingsComponent {}
