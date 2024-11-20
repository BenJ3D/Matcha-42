import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ProfileCreateDto } from '../DTOs/profiles/ProfileCreateDto';
import { ProfileUpdateDto } from '../DTOs/profiles/ProfileUpdateDto';
import { UserResponseDto } from '../DTOs/users/UserResponseDto';
import { Gender } from '../models/Genders';
import { Tag } from '../models/Tags';
import { Photo } from '../models/Photo';
import { UploadPhotoResponse } from '../DTOs/upload-photo-response';
import { UserProfile } from '../models/Profiles';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://localhost:8000/api';
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

  getCompatibleProfiles(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/users/search`).pipe(
      map(this.mapProfilesResponse),
      catchError(this.handleError)
    );
  }

  searchProfiles(searchParams: HttpParams): Observable<UserResponseDto[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/users/search`, { params: searchParams }).pipe(
      map(this.mapProfilesResponse),
      catchError(this.handleError)
    );
  }

  private mapProfilesResponse(profiles: any[]): UserResponseDto[] {
    return profiles.map(profile => ({
      id: profile.id,
      username: profile.username || 'Anonymous',
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      age: profile.age || 'Unknown',
      created_at: profile.created_at,
      profile_id: profile.profile_id,
      biography: profile.biography || '',
      main_photo_url: profile.main_photo_url || 'assets/default-profile.png',
      gender: profile.gender,
      location: profile.location || undefined,
      is_online: profile.is_online,
      is_verified: profile.is_verified,
      last_activity: profile.last_activity,
      photos: profile.photos || [],
      tags: profile.tags || [],
      sexualPreferences: profile.sexualPreferences || [],
      fame_rating: profile.fame_rating || 0,
      blocked: profile.blocked || [],
      likers: profile.likers || [],
      matchers: profile.matchers || [],
      visitors: profile.visitors || [],
      
      // Adding missing required boolean properties
      isLiked: profile.isLiked || false,
      isUnliked: profile.isUnliked || false,
      isMatched: profile.isMatched || false,
      isBlocked: profile.isBlocked || false,
      isFakeReported: profile.isFakeReported || false,
      
      // Adding Me-suffixed properties
      LikedMe: profile.LikedMe || false,
      UnlikedMe: profile.UnlikedMe || false,
      BlockedMe: profile.BlockedMe || false,
      FakeReportedMe: profile.FakeReportedMe || false
    }));
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }

  addLikeUser(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/likes/${id}`, {});
  }
  removeLikeUser(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/likes/${id}`);
  }

  addUnlikeUser(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/unlikes/${id}`, {});
  }
  removeUnlikeUser(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/unlikes/${id}`);
  }

  blockUser(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/blocked-users/${id}`, {});
  }
  unblockUser(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/blocked-users/${id}`);
  }

  reportUser(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/fake-users/${id}`, {});
  }
  unreportUser(id: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/fake-users/${id}`);
  }

}
