import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink, RouterModule} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginDto } from '../../DTOs/login/LoginDto';
import { LoginResponseDTO } from '../../DTOs/login/LoginResponseDTO';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardModule,
  MatCardTitle
} from "@angular/material/card";
import {MatFormField, MatFormFieldModule, MatLabel} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatAnchor, MatButton, MatButtonModule} from "@angular/material/button";
import {MatProgressSpinner, MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {CommonModule, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,           // Ajout du module MatCard
    MatFormFieldModule,      // Ajout du module MatFormField
    MatInputModule,          // Ajout du module MatInput
    MatButtonModule,         // Ajout du module MatButton
    MatProgressSpinnerModule,// Ajout du module MatProgressSpinner
    MatIconModule,           // Ajout du module MatIcon
    RouterModule,            // Pour RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: FormGroup;
  isLoading = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading = true;
      this.form.disable();

      const loginData: LoginDto = this.form.value;
      console.log('Step 1')
      this.authService.login(loginData).subscribe({
        next: (response: LoginResponseDTO) => {
      console.log('Step 2')
          if (response && response.user.is_verified) {
            // La connexion Socket est gérée automatiquement par le SocketService via AuthService
            this.router.navigate(['/home']);
          } else {
            this.loginError = 'Votre compte n\'est pas vérifié.';
            this.authService.logout();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur de connexion:', error);
          this.loginError = error.error?.message || 'Erreur lors de la connexion.';
          this.isLoading = false;
          this.form.enable();
        },
        complete: () => {
          console.log('Connexion terminée');
        },
      });
    }
  }

  loginWithGoogle(): void {
    // Implémenter la logique de login avec Google
    console.log('Connexion avec Google cliquée');
  }
}
