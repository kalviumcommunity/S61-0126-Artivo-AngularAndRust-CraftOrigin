import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, Event } from '@angular/router';
import { NavbarComponent } from '../components/LandingPage/Navigation/navagation';
import { ToastComponent } from './components/toast/toast.component';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('CraftOrigin');
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Hide navbar if the URL starts with /dashboard or /marketplace
      this.showNavbar = !event.urlAfterRedirects.includes('/dashboard') && !event.urlAfterRedirects.includes('/marketplace');
    });
  }
}
