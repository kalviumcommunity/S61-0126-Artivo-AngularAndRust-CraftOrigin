import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, Search, CreditCard, Truck, Heart } from 'lucide-angular';

interface Step {
  icon: any;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './howItWorks.html',
  styleUrl: './howItWorks.css'
})
export class HowItWorksComponent {
  public isBrowser: boolean;

  steps: Step[] = [
    {
      icon: 'search',
      title: 'Discover',
      description: 'Browse authentic handcrafted art from verified tribal and rural artisans across India.',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: 'credit-card',
      title: 'Purchase',
      description: 'Pay securely with our transparent pricing. 85% goes directly to the artist.',
      color: 'bg-accent/10 text-accent',
    },
    {
      icon: 'truck',
      title: 'Receive',
      description: 'Your artwork is carefully packaged and shipped globally with tracking.',
      color: 'bg-amber/10 text-amber',
    },
    {
      icon: 'heart',
      title: 'Impact',
      description: 'Every purchase empowers artisans and preserves traditional art forms.',
      color: 'bg-primary/10 text-primary',
    },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
}
