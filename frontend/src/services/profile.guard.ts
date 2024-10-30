// profile.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {
  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.profileService.getMyProfile().pipe(
      map(profile => {
        if (profile) {
          return true;
        }
        return false;
      }),
      catchError(error => {
        if (error.status === 404) {
          this.router.navigate(['/edit-profile']);
        }
        return of(false);
      })
    );
  }
}
