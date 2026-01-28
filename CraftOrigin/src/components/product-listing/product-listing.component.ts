import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardHeaderComponent } from '../buyer-dashboard/dashboard-header/dashboard-header'; 

@Component({
    selector: 'app-product-listing',
    standalone: true,
    imports: [RouterModule, DashboardHeaderComponent],
    templateUrl: './product-listing.component.html',
    styleUrls: ['./product-listing.component.css']
})
export class ProductListingComponent {
    user = {
        name: '',
        avatar: ''
    };
}
