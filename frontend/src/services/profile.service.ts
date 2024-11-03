import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProfileCreateDto } from '../DTOs/profiles/ProfileCreateDto';
import { ProfileUpdateDto } from '../DTOs/profiles/ProfileUpdateDto';
import { UserResponseDto } from '../DTOs/users/UserResponseDto';
import { Gender } from '../models/Genders';
import { Tag } from '../models/Tags';
import { Photo } from '../models/Photo';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  createProfile(profileData: ProfileCreateDto): Observable<{ profileId: number }> {
    return this.http.post<{ profileId: number }>(`${this.apiUrl}/profiles`, profileData);
  }

  updateProfile(profileData: ProfileUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/profiles`, profileData);
  }

  deleteProfile(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profiles`);
  }

  getMyProfile(): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/users/me`);
  }

  getGenders(): Observable<Gender[]> {
    return this.http.get<Gender[]>(`${this.apiUrl}/genders`);
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`);
  }

  uploadPhoto(photo: File, description?: string): Observable<Photo> {
    const formData = new FormData();
    formData.append('photo', photo);
    if (description) {
      formData.append('description', description);
    }

    return this.http.post<Photo>(`${this.apiUrl}/photos`, formData);
  }

  setMainPhoto(photoId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/photos/${photoId}/set-main`, {});
  }

  deletePhoto(photoId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/photos/${photoId}`);
  }
}
