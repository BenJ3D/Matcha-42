import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

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
export class VerifyEmailComponent implements OnInit {
  verificationMessage: string = 'Verifying your email...';
  isLoading: boolean = true;
  isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const token = this.route.snapshot.queryParamMap.get('token');

      if (token) {
        this.authService.verifyEmail(token).subscribe({
          next: (response: { message: string }) => {
            this.verificationMessage = response.message;
            this.isLoading = false;
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
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

  goToLogin():void {
    this.router.navigate(['/login']);
  }
}
