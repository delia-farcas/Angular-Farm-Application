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
import { Router } from '@angular/router';

/** Executes the Password match validator logic. */
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
  private userService = inject(UserService); // Injectăm noul serviciu
  private trackingService = inject(UserTrackingService);
  private router = inject(Router);

  signupForm: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  /** Handles the submit event. */
  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { email, username, password } = this.signupForm.value;

    const newUser = { email, username, password };

    this.userService.register(newUser).subscribe({
      next: (savedUser) => {
        console.log('Utilizator înregistrat cu succes în Java:', savedUser);

        this.trackingService.logActivity('register');

        alert('Cont creat cu succes!');
        this.goToLogin.emit(); // Sau this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Eroare la înregistrare:', err);
        alert('Eroare: Email-ul este deja folosit sau serverul este offline.');
      },
    });
  }

  /** Handles the login click event. */
  onLoginClick(): void {
    this.goToLogin.emit();
  }
}
