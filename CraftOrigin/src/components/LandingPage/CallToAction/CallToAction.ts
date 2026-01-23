import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-call-to-action',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './CallToAction.html',
  styleUrl: './CallToAction.css'
})
export class CallToActionComponent {
  // Interpolation example
  title = 'Are You an Artisan?';
  subtitle = 'Join our community of 2,500+ artists and sell your handcrafted creations to buyers worldwide. No middlemen, fair prices, global reach.';

  // Property binding example
  primaryBtnDisabled = false;
  primaryBtnText = 'Start Selling Today';
  learnMoreBtnText = 'Learn More';

  // Two-way binding example
  username = '';

  // Trust points (ngFor)
  trustPoints = [
    'Free to join',
    '85% earnings to you',
    'Global shipping support',
    'Dedicated artist support'
  ];

  // Event binding example
  constructor(private router: Router) {}

  onPrimaryClick() {
    this.router.navigate(['/artist-onboarding']);
  }
  onLearnMoreClick() {
    alert('Learn more about joining as an artisan!');
  }
}
