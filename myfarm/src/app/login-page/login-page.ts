import { Component, Output, EventEmitter, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserTrackingService } from '../services/user-tracking.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  @Output() goToSignup = new EventEmitter<void>();
  
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private trackingService = inject(UserTrackingService);
  private router = inject(Router);

  // Folosim email pentru login, deoarece așa am configurat backend-ul Java
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  /** Handles the submit event. */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email } = this.loginForm.value;

    // Apelăm serverul Java prin UserService
    this.userService.login(email).subscribe({
      next: (user) => {
        if (user) {
          console.log('Login reușit!', user);
          
          // Actualizăm tracking-ul local cu datele venite de la server
          this.trackingService.setCurrentUser(user.username);
          this.trackingService.setLastLogin();
          this.trackingService.logActivity('login');
          
          // Navigăm către lista de animale
          this.router.navigate(['/list']);
        }
      },
      error: (err) => {
        // Dacă serverul Java returnează 401 Unauthorized sau 404
        alert('Email incorect sau utilizator inexistent!');
        console.error('Login error:', err);
      }
    });
  }

  /** Handles the signup click event. */
  onSignupClick(): void {
    this.goToSignup.emit();
  }
}