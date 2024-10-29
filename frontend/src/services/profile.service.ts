import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProfileCreateDto } from '../DTOs/profiles/ProfileCreateDto';
import { ProfileUpdateDto } from '../DTOs/profiles/ProfileUpdateDto';
import { ProfileResponseDto } from '../DTOs/profiles/ProfileResponseDto';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8000/api/profiles';

  constructor(private http: HttpClient) {}

  createProfile(profileData: ProfileCreateDto): Observable<{ profileId: number }> {
    return this.http.post<{ profileId: number }>(`${this.apiUrl}`, profileData);
  }

  getMyProfile(): Observable<ProfileResponseDto> {
    return this.http.get<ProfileResponseDto>(`${this.apiUrl}/me`);
  }

  updateProfile(profileData: ProfileUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, profileData);
  }

  deleteProfile(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}`);
  }
}
