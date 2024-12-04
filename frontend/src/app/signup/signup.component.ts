import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
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
import { UserCreateDto } from '../../DTOs/users/UserCreateDto';

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
    this.form = this.fb.group(
      {
        username: ['', [Validators.required, Validators.maxLength(50)]],
        first_name: ['', [Validators.required, Validators.maxLength(255)]],
        last_name: ['', [Validators.required, Validators.maxLength(255)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.checkPasswords,
      }
    );
  }

  checkPasswords(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : { notSame: true };
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    this.form.disable();

    const userData: UserCreateDto = {
      username: this.form.get('username')?.value,
      first_name: this.form.get('first_name')?.value,
      last_name: this.form.get('last_name')?.value,
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
    };

    this.authService.signup(userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.form.enable();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error(error);
        this.isLoading = false;
        this.form.enable();
      },
    });
  }
}
