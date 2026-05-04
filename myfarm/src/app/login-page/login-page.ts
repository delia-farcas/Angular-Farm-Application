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

    const { email, password } = this.loginForm.value;

    this.userService.login(email, password).subscribe({
      next: (user) => {
        if (user) {
          console.log('Login reușit!', user);

          this.trackingService.setCurrentUser(user.username, user.userId);
          this.trackingService.setLastLogin();
          this.trackingService.logActivity('login');

          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        alert('Email sau parolă incorectă, sau utilizator inexistent.');
        console.error('Login error:', err);
      },
    });
  }

  /** Handles the signup click event. */
  onSignupClick(): void {
    this.goToSignup.emit();
  }
}
