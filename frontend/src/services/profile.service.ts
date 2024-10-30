import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProfileCreateDto } from '../DTOs/profiles/ProfileCreateDto';
import { ProfileUpdateDto } from '../DTOs/profiles/ProfileUpdateDto';
import { ProfileResponseDto } from '../DTOs/profiles/ProfileResponseDto';
import { Gender } from '../models/Genders'
import { Tag } from '../models/Tags';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  createProfile(profileData: ProfileCreateDto): Observable<{ profileId: number }> {
    return this.http.post<{ profileId: number }>(`${this.apiUrl}/profiles`, profileData);
  }

  getMyProfile(): Observable<ProfileResponseDto> {
    return this.http.get<ProfileResponseDto>(`${this.apiUrl}/users/me`);
  }

  updateProfile(profileData: ProfileUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/profiles`, profileData);
  }

  deleteProfile(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profiles`);
  }

  getGenders(): Observable<Gender[]> {
    return this.http.get<Gender[]>(`${this.apiUrl}/genders`);
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`);
  }
}
