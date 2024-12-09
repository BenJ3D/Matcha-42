import {Component, OnInit, Inject, PLATFORM_ID, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {ToastService} from "../../services/toast.service";

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  verificationMessage: string = 'Verifying your email...';
  isLoading: boolean = true;
  isBrowser: boolean;
  protected verificationIsOk: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private timeoutRef?: number;

  ngOnInit(): void {
    if (this.isBrowser) {
      const token = this.route.snapshot.queryParamMap.get('token');

      if (token) {
        this.authService.verifyEmail(token).subscribe({
          next: (response: { message: string }) => {
            this.verificationMessage = response.message;
            this.isLoading = false;
            this.verificationIsOk = true;
            this.timeoutRef = window.setTimeout(() => {
              this.router.navigate(['/login']);
            }, 4000);
          },
          error: (error: any) => {
            this.verificationMessage =
              error?.error?.message || 'An error occurred while verifying your email.';
            this.isLoading = false;
          },
        });
      } else {
        this.verificationMessage = 'Verification token not found in the URL.';
        this.isLoading = false;
      }
    } else {
      this.verificationMessage = 'Loading...';
      this.isLoading = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendEmail() {
    this.authService.resendVerificationEmail().subscribe({
      next: () => {
        this.toastService.show('Verification email resent successfully.', 'Close');
        this.goToLogin();
      },
      error: () => {
        this.toastService.show('Error resending the email.', 'Close');
        this.goToLogin();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.timeoutRef !== undefined) {
      clearTimeout(this.timeoutRef);
    }
  }
}
