import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from './admin-header/admin-header';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterModule, AdminHeaderComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {}
