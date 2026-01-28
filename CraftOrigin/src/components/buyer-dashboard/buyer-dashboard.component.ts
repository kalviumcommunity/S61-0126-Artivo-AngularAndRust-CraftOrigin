import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [RouterModule, DashboardHeaderComponent],
  templateUrl: './buyer-dashboard.component.html',
  styleUrls: ['./buyer-dashboard.component.css']
})
export class BuyerDashboardComponent {
  user = {
    name: 'John Doe',
    avatar: '' // You can set a default avatar path here
  };

  logout() {
    // TODO: Implement logout logic
    window.location.href = '/login';
  }
}
