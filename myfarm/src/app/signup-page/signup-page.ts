import { Component, Output, EventEmitter, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserTrackingService } from '../services/user-tracking.service';

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.css',
})
export class SignupPage {
  @Output() goToLogin = new EventEmitter<void>();
  @Output() signupSuccess = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private trackingService = inject(UserTrackingService);

  signupForm: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    
    // Save user profile in tracking service local storage
    const formData = { ...this.signupForm.value };
    delete formData.confirmPassword; // Avoid saving confirmation
    this.trackingService.registerUser(formData);

    this.signupSuccess.emit();
  }

  onLoginClick(): void {
    this.goToLogin.emit();
  }
}
