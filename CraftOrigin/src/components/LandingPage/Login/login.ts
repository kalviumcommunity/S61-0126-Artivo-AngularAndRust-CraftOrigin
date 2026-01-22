import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

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

  private apiUrl: string = 'http://localhost:8080/api/auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
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

  // Navigate to registration page
  navigateToRegister(): void {
    this.router.navigate(['/register']).catch(() => {
      console.log('Register route not found');
    });
  }
}
