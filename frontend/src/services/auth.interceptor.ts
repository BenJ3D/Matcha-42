import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  let authReq = req;
  const accessToken = localStorage.getItem('accessToken');

  if (accessToken) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`),
    });
  }

  return next(authReq).pipe(
    catchError(error => {
      if (error.status === 401) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            if (response && response.accessToken) {
              localStorage.setItem('accessToken', response.accessToken);
              localStorage.setItem('refreshToken', response.refreshToken);
              // console.log("refreshed tokens");

              const newAuthReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${response.accessToken}`),
              });

              return next(newAuthReq);
            } else {
              authService.logout();
              return throwError(() => error);
            }
          }),
          catchError(err => {
            authService.logout();
            return throwError(() => err);
          })
        );
      } else {
        return throwError(() => error);
      }
    })
  );
};
