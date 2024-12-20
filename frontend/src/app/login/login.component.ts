import {Component} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {LoginDto} from '../../DTOs/login/LoginDto';
import {LoginResponseDTO} from '../../DTOs/login/LoginResponseDTO';
import {Router, RouterModule} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CommonModule} from '@angular/common';
import {RequestPassComponent} from "./request-pass/request-pass.component";

export enum ELoginStep {
  'idle',
  'resetpass',
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterModule,
    RequestPassComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: FormGroup;
  isLoading = false;
  loginError: string | null = null;
  public editStep: ELoginStep = ELoginStep.idle;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;

      const loginData: LoginDto = {
        email: this.form.get('email')?.value,
        password: this.form.get('password')?.value,
      };

      this.authService.login(loginData).subscribe({
        next: (response: LoginResponseDTO) => {
          this.isLoading = false;
          if (response) {
            if (response.accessToken)
              localStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken)
              localStorage.setItem('refreshToken', response.refreshToken);
          }
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          this.form.enable();
        },
      });
    }
  }

  goToRequestNewPass() {
    this.editStep = ELoginStep.resetpass;
  }

  cancelRequestNewPass() {
    this.editStep = ELoginStep.idle;
  }

  protected readonly ELoginStep = ELoginStep;
}
