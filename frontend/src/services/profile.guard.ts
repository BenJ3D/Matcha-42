import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { UserResponseDto } from '../DTOs/users/UserResponseDto';

@Injectable({
  providedIn: 'root',
})
export class ProfileGuard implements CanActivate {
  constructor(private profileService: ProfileService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.profileService.getMyProfile().pipe(
      map((user: UserResponseDto) => !!user.profile_id),
      tap((hasProfile) => {
        if (!hasProfile) {
          this.router.navigate(['/edit-profile']);
        }
      }),
      catchError((error) => {
        this.router.navigate(['/edit-profile']);
        return of(false);
      })
    );
  }
}
