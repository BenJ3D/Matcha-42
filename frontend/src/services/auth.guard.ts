import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isTokenValid().pipe(
    map(isValid => {
      if (!isValid) {
        router.navigate(['/login']);
        return false;
      }
      return true;
    }),
    catchError((error) => {
      if (error.status === 401) {
        router.navigate(['/login']);
      }
      return [false];
    })
  );
};
