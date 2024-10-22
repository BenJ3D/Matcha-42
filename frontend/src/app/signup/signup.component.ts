import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  form: FormGroup;
  isLoading = false;
  signupError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    const formOptions: AbstractControlOptions = {
      validators: this.checkPasswords,
    };

    this.form = this.fb.group(
      {
        username: ['', Validators.required],
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', Validators.required],
      },
      formOptions
    );
  }

  checkPasswords(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      console.log('Invalid form');
      return;
    }

    this.isLoading = true;
    this.form.disable();

    const formValues = this.form.value;

    const signupData = {
      username: formValues.username,
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      email: formValues.email,
      password: formValues.password,
    };

    this.authService.signup(signupData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.log(error);
        this.isLoading = false;
        this.form.enable();
        
        if (error.error && error.error.error) {
          // The backend sends { "error": "..." }
          this.signupError = error.error.error;
        } else if (error.message) {
          this.signupError = `Error: ${error.message}`;
        } else {
          this.signupError = 'Signup failed. Please try again.';
        }
      },
      complete: () => {
        console.log('Complete');
      },
    });
  }

  signupWithGoogle(): void {
    // Implement Google signup logic here
    console.log('Google signup clicked');
  }
}
