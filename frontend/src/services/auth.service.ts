import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LoginResponseDTO } from "../DTOs/login/LoginResponseDTO";
import { UserResponseDto } from "../DTOs/users/UserResponseDto";
import { LoginDto } from "../DTOs/login/LoginDto";
import { environment } from "../environment/environment";

interface SignupResponse {
  userId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiURL;
  private userSubject = new BehaviorSubject<UserResponseDto | null>(null);
  public user$ = this.userSubject.asObservable();
  private readonly isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        this.isTokenValid().subscribe((isValid) => {
          if (isValid) {
            this.fetchUserProfile().subscribe();
          } else {
            this.logout();
          }
        });
      }
    }
  }

  initUser(): void {
    if (this.isBrowser) {
      this.loadCurrentUser();
    }
  }

  fetchUserProfile(): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/users/me`).pipe(
      tap((user) => this.userSubject.next(user)),
      catchError((error) => {
        this.logout();
        return of(null as any);
      })
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(
      `${this.apiUrl}/verify-email?token=${token}`
    );
  }

  resendVerificationEmail(): Observable<{ message: string }> {
    let token = localStorage.getItem('accessToken');
    if (!token)
      token = localStorage.getItem('resendToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    localStorage.removeItem('resendToken');

    return this.http.get<{ message: string }>(
      `${this.apiUrl}/verify-email/resend`,
      { headers }
    );
  }

  signup(signupData: any): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/users`, signupData);
  }

  login(loginData: LoginDto): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        if (this.isBrowser) {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        this.userSubject.next(response.user);
      }),
      catchError((error) => {
        return of(null as any);
      })
    );
  }

  logout(): void {
    this.router.navigate(['/login']).then();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userSubject.next(null);
  }

  isTokenValid(): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return of(false);
    }

    return this.http
      .get<{ valid: boolean }>(`${this.apiUrl}/verify-token`)
      .pipe(map((response) => response.valid));
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return of(null);
    }

    return this.http.post<any>(`${this.apiUrl}/login/refresh`, { "refreshToken": refreshToken }).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.userSubject.next(response.user);
      }),
      catchError((error) => {
        this.logout();
        return of(null);
      })
    );
  }

  getCurrentUser(): Observable<UserResponseDto | null> {
    if (!this.isBrowser) {
      return of(null as any);
    }
    return this.http.get<UserResponseDto>(`${this.apiUrl}/users/me`).pipe(
      catchError((error) => {
        return of(null as any);
      })
    );
  }

  getCurrentUserId(): number {
    const user = this.userSubject.value;
    return user ? user.id : 0;
  }

  private loadCurrentUser(): void {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      this.getCurrentUser().subscribe({
        next: (user) => {
          if (user && user.is_verified) {
            this.userSubject.next(user);
          } else {
            this.logout();
          }
        },
        error: (error) => {
          this.logout();
        },
      });
    }
  }
}
