import { User } from './../models/User';
// profile.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { Observable, of, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserResponseDto } from '../DTOs/users/UserResponseDto';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {
  constructor(
    private profileService: ProfileService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    console.log('Camille')
    return this.profileService.getMyProfile().pipe(
      map((user: UserResponseDto) => {
        console.log('Esteban' + user)
        if (user.profile_id) {
          return true;
        }
        this.router.navigate(['/edit-profile']);

        return false;
      }),
      catchError((error) => {
        console.log('Esteban' + error)
        if (error.status === 404) {
          this.router.navigate(['/edit-profile']);
        }
        return false;
      })
    );
  }
}

