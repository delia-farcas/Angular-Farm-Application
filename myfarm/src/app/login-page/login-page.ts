import { Component, Output, EventEmitter, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserTrackingService } from '../services/user-tracking.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { InactivityTimerService } from '../services/inactivity-timer.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  @Output() goToSignup = new EventEmitter<void>();
  private inactivityTimer = inject(InactivityTimerService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private trackingService = inject(UserTrackingService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      const response = await firstValueFrom(this.userService.login(email, password));
      if (response && response.user) {
        this.trackingService.setCurrentUser(
          response.user.username,
          response.user.role,
          response.user.userId,
        );

        this.trackingService.setLastLogin();
        this.trackingService.logActivity('login');
        this.inactivityTimer.startMonitoring();
        await this.router.navigate(['/home']);
      }
    } catch (err) {
      alert('Email sau parolă incorectă, sau utilizator inexistent.');
      console.error('Login error:', err);
    }
  }

  onSignupClick(): void {
    this.goToSignup.emit();
  }
}
