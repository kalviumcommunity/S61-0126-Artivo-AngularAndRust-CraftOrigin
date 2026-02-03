import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../Footer/footer.component';
import { AuthService } from '../../../app/services/auth.service';

@Component({
  selector: 'app-sell-art',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './sellArt.html',
  styleUrl: './sellArt.css'
})
export class SellArtComponent {
  
  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  onStartSelling() {
    if (this.authService.isAuthenticated()) {
      // Check if artist? For now, let's just send to onboarding which can handle "already applied" logic or dashboard redirect
      // Ideally we check if they are already an artist.
      // But for now, let's send to onboarding. 
      // Actually, if they are an artist, they should go to dashboard.
      // Since we don't store "is_artist" in local storage easily (unless we add it to login response),
      // we can let them go to onboarding, and if onboarding detects they are already artist, it redirects.
      // Or we can just send them to dashboard if they have the role.
      this.router.navigate(['/artist-onboarding']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
