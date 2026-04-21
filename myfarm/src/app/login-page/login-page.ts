import { Component, Output, EventEmitter, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserTrackingService } from '../services/user-tracking.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  @Output() goToSignup = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();
  private fb = inject(FormBuilder);
  private trackingService = inject(UserTrackingService);

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    // TODO: handle login logic
    console.log('Login:', this.loginForm.value);
    this.trackingService.setLastLogin();
    this.trackingService.logActivity('login');
    this.loginSuccess.emit();
  }

  onSignupClick(): void {
    this.goToSignup.emit();
  }

}
