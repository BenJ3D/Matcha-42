import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface SignupResponse {
  userId: number;
}

interface ResendVerificationResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(
      `${this.apiUrl}/verify-email?token=${token}`
    );
  }

  resendVerificationEmail(): Observable<ResendVerificationResponse> {
    return this.http.post<ResendVerificationResponse>(`${this.apiUrl}/verify-email/resend`, {});
  }

  signup(signupData: any): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.apiUrl}/users`, signupData);
  }

  login(loginData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData);
  }

  isTokenValid(): Observable<boolean> {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return new Observable<boolean>((observer) => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.http
      .get<{ valid: boolean }>(`${this.apiUrl}/verify-token`)
      .pipe(map((response) => response.valid));
  }
}
