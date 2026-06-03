import { Component, Output, EventEmitter, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { UserTrackingService } from '../services/user-tracking.service';
import { UserService } from '../services/user.service';
import { firstValueFrom } from 'rxjs';

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
  private userService = inject(UserService);
  private trackingService = inject(UserTrackingService);

  signupForm: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { email, username, password } = this.signupForm.value;

    const newUser = { email, username, password };

    try {
      await firstValueFrom(this.userService.register(newUser));
      this.trackingService.logActivity('register');
      alert('Cont creat cu succes!');
      this.goToLogin.emit();
    } catch (err) {
      console.error('Eroare la înregistrare:', err);
      alert('Eroare: Email-ul este deja folosit sau serverul este offline.');
    }
  }

  onLoginClick(): void {
    this.goToLogin.emit();
  }
}
