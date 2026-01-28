import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
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
    id: string; // UUID from backend
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
    RouterModule,
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
    
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.post<LoginResponse>(this.registerApiUrl, {
      name: data.name,
      email: data.email,
      password: data.password
    }, { headers }).subscribe({
      next: (res) => {
        this.registerLoading = false;
        if (res && res.token) {
          // Store auth data
          localStorage.setItem('authToken', res.token);
          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
          }
          this.registerSuccess = 'Account created! You can now sign in.';
          setTimeout(() => {
            this.authMode = 'signin';
          }, 1200);
        }
      },
      error: (error) => {
        this.registerLoading = false;
        console.error('Registration error:', error);
        
        if (error.status === 409) {
          this.registerError = 'This email is already registered. Please sign in.';
        } else if (error.status === 400) {
          this.registerError = error.error?.message || 'Invalid input. Please check your information.';
        } else if (error.status === 0) {
          this.registerError = 'Unable to connect to server. Please check your connection.';
        } else {
          this.registerError = error.error?.message || 'Registration failed. Please try again.';
        }
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
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<LoginResponse>(this.apiUrl, credentials, { headers }).pipe(
      catchError((error) => {
        // Re-throw error to be handled by the subscribe error handler
        return throwError(() => error);
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

  // Scroll to section on the same page
  scrollToSection(sectionId: string): void {
    // Close mobile menu if open
    this.isOpen = false;
    
    // Check if we're on the home page
    const currentUrl = this.router.url;
    const isOnHomePage = currentUrl === '/' || currentUrl === '';
    
    if (!isOnHomePage) {
      // Navigate to home first, then scroll to section
      this.router.navigate(['/']).then(() => {
        // Wait for the DOM to update after navigation
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      });
    } else {
      // Already on home page, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Navigate to About Us page
  navigateToAbout(): void {
    this.router.navigate(['/about']);
    this.isOpen = false;
  }

  // Navigate to Home/Landing page
  navigateToHome(): void {
    this.router.navigate(['/']);
    this.isOpen = false;
    // Scroll to top when navigating to home
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Navigate to Sell Art page
  navigateToSellArt(): void {
    this.router.navigate(['/sell-art']);
    this.isOpen = false;
  }
}
