import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { RegisterComponent } from '../Register/register';
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
  // showRegisterModal: boolean = false;

  private apiUrl: string = 'http://localhost:8080/api/auth/login';
  // private registrationSuccessListener: any;

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
        
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        this.router.navigate(['/dashboard']).catch(() => {
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
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

  private login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      catchError((error) => {
        console.warn('Backend not available, using mock login:', error);
        
        if (credentials.email && credentials.password) {
          return of({
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: "",
              name: 'Demo User',
              email: credentials.email
            }
          });
        }
        
        throw error;
      })
    );
  }

  // Navigate to register page
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}