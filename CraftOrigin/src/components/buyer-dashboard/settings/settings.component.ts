import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-buyer-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class BuyerSettingsComponent {
  passwordForm: any;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  changePassword() {
    this.error = '';
    this.success = '';
    this.loading = true;
    // TODO: Integrate with backend for password change
    setTimeout(() => {
      if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
        this.error = 'Passwords do not match.';
        this.loading = false;
        return;
      }
      this.success = 'Password changed successfully!';
      this.loading = false;
      this.passwordForm.reset();
    }, 1200);
  }
}
