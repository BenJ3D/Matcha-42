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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }
 
  signup(signupData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users`, signupData);
  }

  login(loginData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData);
  }

  isTokenValid(): Observable<boolean> {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.http.post<{valid: boolean}>(`${this.apiUrl}/token/verify-token`, { token })
    .pipe(
      map(response => response.valid)
      );

  }
}
