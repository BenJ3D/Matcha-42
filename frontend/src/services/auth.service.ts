import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {BehaviorSubject, map, Observable, of, tap} from 'rxjs';
import {LoginResponseDTO} from "../DTOs/login/LoginResponseDTO";
import {catchError} from "rxjs/operators";
import {UserResponseDto} from "../DTOs/users/UserResponseDto";
import {LoginDto} from "../DTOs/login/LoginDto";
import {SignupResponseDto} from "../DTOs/signup/SignupResponseDto";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<UserResponseDto | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {

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

  signup(signupData: any): Observable<SignupResponseDto> {
    return this.http.post<SignupResponseDto>(`${this.apiUrl}/users`, signupData);
  }

  login(loginData: LoginDto): Observable<LoginResponseDTO> {
        console.log('hey');
    return this.http.post<LoginResponseDTO>(`${this.apiUrl}/login`, loginData).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        console.log(response);
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
}
