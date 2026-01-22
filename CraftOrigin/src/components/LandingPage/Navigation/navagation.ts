import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

// Login request interface
interface LoginRequest {
  email: string;
  password: string;
}

// Login response interface
interface LoginResponse {
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  message?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css'
})

export class NavbarComponent {
  isOpen = false;
  showAuthModal = false;
  authMode: 'signin' | 'signup' = 'signin';
  loginForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;
  // Registration form state
  registerForm: FormGroup;
  registerLoading: boolean = false;
  registerError: string = '';
  registerSuccess: string = '';
  showRegisterPassword: boolean = false;
  showRegisterConfirmPassword: boolean = false;

  private apiUrl: string = 'http://localhost:8080/api/auth/login';
  private registerApiUrl: string = 'http://localhost:8080/api/auth/register';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }



  openAuthModal(mode: 'signin' | 'signup' = 'signin') {
    this.authMode = mode;
    this.showAuthModal = true;
    this.loginForm.reset();
    this.errorMessage = '';
    this.registerForm.reset();
    this.registerError = '';
    this.registerSuccess = '';
  }

  setAuthMode(mode: 'signin' | 'signup') {
    this.authMode = mode;
    // Do not reset forms here to preserve user input when toggling tabs
  }

  closeAuthModal() {
    this.showAuthModal = false;
    this.loginForm.reset();
    this.errorMessage = '';
    this.registerForm.reset();
    this.registerError = '';
    this.registerSuccess = '';
  }


  // Removed closeLoginModal and closeRegisterModal, replaced by closeAuthModal
  // Registration logic
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get registerName() { return this.registerForm.get('name'); }
  get registerEmail() { return this.registerForm.get('email'); }
  get registerPassword() { return this.registerForm.get('password'); }
  get registerConfirmPassword() { return this.registerForm.get('confirmPassword'); }

  toggleRegisterPasswordVisibility() { this.showRegisterPassword = !this.showRegisterPassword; }
  toggleRegisterConfirmPasswordVisibility() { this.showRegisterConfirmPassword = !this.showRegisterConfirmPassword; }

  onRegisterSubmit() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }
    this.registerLoading = true;
    this.registerError = '';
    this.registerSuccess = '';
    const data = this.registerForm.value;
    this.http.post<any>(this.registerApiUrl, data).pipe(
      catchError((error) => {
        this.registerLoading = false;
        this.registerError = error.error?.message || 'Registration failed.';
        return of(null);
      })
    ).subscribe((res) => {
      this.registerLoading = false;
      if (res && res.token) {
        this.registerSuccess = 'Account created! You can now sign in.';
        setTimeout(() => {
          this.authMode = 'signin';
        }, 1200);
      }
    });
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Get form control for easy access in template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // Handle form submission
  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
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
        
        // Store token if provided
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        // Store user data if provided
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Close modal and navigate
        this.closeAuthModal();
        
        // Navigate to dashboard or home
        this.router.navigate(['/dashboard']).catch(() => {
          this.router.navigate(['/']); // Fallback to home if dashboard route doesn't exist
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        // Handle different error scenarios
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }

  // Login API call
  private login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      catchError((error) => {
        // If backend is not available, use mock response for development
        console.warn('Backend not available, using mock login:', error);
        
        // Mock successful login for development
        if (credentials.email && credentials.password) {
          return of({
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 1,
              name: 'Demo User',
              email: credentials.email
            }
          });
        }
        
        throw error;
      })
    );
  }

  // Switch to register modal from login
  navigateToRegister(): void {
    this.setAuthMode('signup');
  }

  navigateToLogin(): void {
    this.setAuthMode('signin');
  }
}
