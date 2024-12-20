import {HttpInterceptorFn} from '@angular/common/http';
import {inject, Injector} from '@angular/core';
import {catchError, switchMap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {AuthService} from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

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
        const authService = injector.get(AuthService);
        return authService.refreshToken().pipe(
          switchMap(response => {
            if (response && response.accessToken) {
              localStorage.setItem('accessToken', response.accessToken);
              localStorage.setItem('refreshToken', response.refreshToken);
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
            const authService = injector.get(AuthService);
            const token = localStorage.getItem('accessToken');
            localStorage.setItem('resendToken', token ?? '');
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
