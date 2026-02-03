import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartService } from '../../../app/services/cart.service';
interface LoginRequest {
  email: string;
  password: string;
}


interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  message?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  toastMessage: string = '';
  toastVisible: boolean = false;
  // showRegisterModal: boolean = false;

  private apiUrl: string = 'http://localhost:8080/api/auth/login';
  // private registrationSuccessListener: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cartService: CartService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // ngOnInit(): void {}
  // ngOnDestroy(): void {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response.token || !response.user) {
          this.errorMessage = 'Invalid login response. Please try again.';
          return;
        }
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.cartService.loadCart();
        
        console.log('Login successful. User Role:', response.user?.role); // Debug log

        if (response.user?.role === 'ARTIST') {
          console.log('Redirecting to Artist Dashboard');
          this.router.navigate(['/artist/dashboard']);
        } else {
          console.log('Redirecting to Marketplace');
          this.router.navigate(['/marketplace']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'You are not registered. Please click “Sign Up” to register.';
          this.showToast('You are not registered. Please click “Sign Up” to register.');
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  private login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials);
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
      this.toastMessage = '';
    }, 3000);
  }

  // Navigate to register page
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
