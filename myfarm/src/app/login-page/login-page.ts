import { Component, Output, EventEmitter, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  @Output() goToSignup = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();
  private fb = inject(FormBuilder);

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
    this.loginSuccess.emit();
  }

  onSignupClick(): void {
    this.goToSignup.emit();
  }

}