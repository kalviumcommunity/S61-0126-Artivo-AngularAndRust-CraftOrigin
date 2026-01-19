import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule
  ],
  templateUrl: './heroSection.html',
  styleUrl: './heroSection.css'
})
export class HeroSectionComponent {
  heroImage = 'assets/hero-artisan.jpg';
}
