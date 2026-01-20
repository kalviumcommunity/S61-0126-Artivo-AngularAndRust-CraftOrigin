import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, Star, MapPin } from 'lucide-angular';

@Component({
    selector: 'app-featured-artists',
    standalone: true,
    imports: [
        CommonModule,
        LucideAngularModule
    ],
    templateUrl: './featuredArtists.html',
    styleUrl: './featuredArtists.css'
})
export class FeaturedArtistsComponent {
    public isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.isBrowser = isPlatformBrowser(this.platformId);
    }

    artists = [
        {
            name: 'Lakshmi Devi',
            craft: 'Pottery & Ceramics',
            location: 'Khurja, Uttar Pradesh',
            image: 'assets/artist-1.jpg',
            rating: 4.9,
            products: 47,
        },
        {
            name: 'Ramesh Kumar',
            craft: 'Handloom Weaving',
            location: 'Pochampally, Telangana',
            image: 'assets/artist-2.jpg',
            rating: 4.8,
            products: 32,
        },
        {
            name: 'Meera Bhil',
            craft: 'Warli Painting',
            location: 'Dahanu, Maharashtra',
            image: 'assets/artist-3.jpg',
            rating: 5.0,
            products: 28,
        },
    ];
}
