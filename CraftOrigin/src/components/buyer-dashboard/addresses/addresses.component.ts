import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BuyerService } from '../buyer.service';
import { Address } from '../models';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-buyer-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.css']
})
export class BuyerAddressesComponent implements OnInit {
  addresses: Address[] = [];
  loading = true;
  error = '';
  addMode = false;
  addressForm: any;

  constructor(
    private buyerService: BuyerService, 
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.addressForm = this.fb.group({
      line1: [''],
      line2: [''],
      city: [''],
      state: [''],
      zip: [''],
      country: ['']
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.buyerService.getAddresses().subscribe({
        next: (addresses: Address[]) => {
          this.addresses = addresses;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load addresses.';
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  showAddForm() {
    this.addMode = true;
    this.addressForm.reset();
  }

  cancelAdd() {
    this.addMode = false;
  }

  saveAddress() {
    // TODO: Integrate with backend to save address
    this.addresses.push({ id: Date.now().toString(), ...this.addressForm.value } as Address);
    this.addMode = false;
  }
}
