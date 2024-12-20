import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {ProfileService} from "../../services/profile.service";
import {response} from "express";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {ToastService} from "../../services/toast.service";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatError,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  verificationMessage: string = 'Verifying your email...';
  isLoading: boolean = false;
  isBrowser: boolean;
  resetPasswordForm!: FormGroup;
  private token: string | null = ''


  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private router: Router,
    private fb: FormBuilder,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.token = this.route.snapshot.queryParamMap.get('token');
      if (!this.token) {
        this.toastService.show('There is an error with the url link, no token is provided');
        this.goToLogin();
      }
    }
    this.initializeForm();
  }

  initializeForm() {
    this.resetPasswordForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.checkPasswords,
      });
  }

  checkPasswords(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return pass === confirmPass ? null : {notSame: true};
  }

  onSubmit(): void {
    if (this.isBrowser) {
      const token = this.route.snapshot.queryParamMap.get('token');
      if (token) {
        const data = {token: token, newPassword: this.resetPasswordForm.get('password')?.value};
        this.isLoading = true; // Démarre le chargement
        this.profileService.resetPassword(data).subscribe({
          error: (error: any) => {
            this.verificationMessage =
              error?.error?.message || 'Une erreur est survenue lors de la vérification de votre email.';
            if (error?.error?.code === 'PASSWORD_WEAK') {
              this.resetPasswordForm.get('password')?.setErrors({weakPassword: true});
            }
            this.isLoading = false;
          },
          next: () => {
            this.toastService.showWithAction('Votre mot de passe a été réinitialisé.', 'Go to login', this.goToLogin.bind(this));
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 4000);
          },
          complete: () => {
          },
        });
      } else {
        this.verificationMessage = 'Le token de vérification est introuvable dans l\'URL.';
        this.isLoading = false;
      }
    } else {
      this.verificationMessage = 'Chargement...';
      this.isLoading = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
