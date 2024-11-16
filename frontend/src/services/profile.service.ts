// src/app/services/profile.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ProfileCreateDto} from '../DTOs/profiles/ProfileCreateDto';
import {ProfileUpdateDto} from '../DTOs/profiles/ProfileUpdateDto';
import {UserResponseDto} from '../DTOs/users/UserResponseDto';
import {Gender} from '../models/Genders';
import {Tag} from '../models/Tags';
import {Photo} from '../models/Photo';
import {UploadPhotoResponse} from '../DTOs/upload-photo-response';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://localhost:8000/api'; // Remplacez par l'URL de votre API

  private userSubject = new BehaviorSubject<UserResponseDto | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  // Méthode pour récupérer les données de l'utilisateur
  getMyProfile(): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/users/me`).pipe(
      tap((userResponse) => {
        this.userSubject.next(userResponse);
      })
    );
  }

  createProfile(profileData: ProfileCreateDto): Observable<{ profileId: number }> {
    return this.http.post<{ profileId: number }>(`${this.apiUrl}/profiles`, profileData);
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

  uploadPhoto(photo: File, description?: string): Observable<Photo> {
    const formData = new FormData();
    formData.append('photo', photo); // Le nom du champ doit correspondre
    if (description) {
      formData.append('description', description);
    }

    return this.http
      .post<UploadPhotoResponse>(`${this.apiUrl}/photos`, formData)
      .pipe(
        tap(() => {
          // Après un upload réussi, recharger les données utilisateur
          this.getMyProfile().subscribe();
        }),
        map((response) => response.photo) // Extraction de l'objet 'photo'
      );
  }

  setMainPhoto(photoId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/photos/${photoId}/set-main`, {}).pipe(
      tap(() => {
        // Après avoir défini la photo principale, recharger les données utilisateur
        this.getMyProfile().subscribe();
      })
    );
  }

  deletePhoto(photoId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/photos/${photoId}`).pipe(
      tap(() => {
        // Après la suppression d'une photo, recharger les données utilisateur
        this.getMyProfile().subscribe();
      })
    );
  }

  getUserById(id: number): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/users/${id}`);
  }
}
