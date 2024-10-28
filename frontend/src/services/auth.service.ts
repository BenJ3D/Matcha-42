import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core'
import {BehaviorSubject, map, Observable, of, tap} from 'rxjs';
import {LoginResponseDTO} from "../DTOs/login/LoginResponseDTO";
import {catchError} from "rxjs/operators";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {LoginDto} from "../DTOs/login/LoginDto";
import {SignupResponseDto} from "../DTOs/signup/SignupResponseDto";
import {Router} from "@angular/router";
import { isPlatformBrowser } from '@angular/common';
import bootstrap from "../main.server";



interface SignupResponse {
  userId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<UserResponseDto | null>(null);
  public user$ = this.userSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.loadCurrentUser();
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

  // Méthode pour récupérer le profil utilisateur
  fetchUserProfile(): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/users/me`).pipe(
      tap((user) => this.userSubject.next(user)),
      catchError((error) => {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
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
    return this.http.get<{ message: string }>(
      `${this.apiUrl}/verify-email/resend`
    );
  }

  signup(signupData: any): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/users`, signupData);
  }

  login(loginData: LoginDto): Observable<LoginResponseDTO> {
        console.log('hey');
    return this.http.post<LoginResponseDTO>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        if(this.isBrowser) {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          console.log(response);
        }
        this.userSubject.next(response.user);
      }),
      catchError((error) => {
        console.error('Erreur de connexion:', error);
        return of(null as any);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
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

  // Méthode pour rafraîchir le token (optionnelle)
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return of(null);
    }

    return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.userSubject.next(response.user);
      }),
      catchError((error) => {
        console.error('Erreur de rafraîchissement du token:', error);
        this.logout();
        return of(null);
      })
    );
  }

  private loadCurrentUser(): void {
    console.log('try load user (auth.service.ts:114)')
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      // Récupérer les informations de l'utilisateur depuis le backend
      this.getCurrentUser().subscribe({
        next: (user) => {
          if (user && user.is_verified) {
            this.userSubject.next(user);
          } else {
            this.logout();
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'utilisateur:', error);
          this.logout();
        },
      });
    }
  }

  getCurrentUser(): Observable<UserResponseDto| null> {
    if (!this.isBrowser) {
      return of(null as any);
    }
    return this.http.get<UserResponseDto>(`${this.apiUrl}/users/me`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return of(null as any);
      })
    );
  }

  getCurrentUserId(): number {
    const user = this.userSubject.value;
    return user ? user.id : 0; // Ajustez selon votre structure UserResponseDto
  }

}
