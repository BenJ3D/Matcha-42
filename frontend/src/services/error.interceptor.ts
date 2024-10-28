// src/app/services/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from './toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status >= 400 && error.status < 500) {
        const errorMessage =
          error.error?.error ||
          error.error?.message ||
          error.message ||
          'An unexpected error occurred.';
        toastService.show(errorMessage, 'Close');
      }
      return throwError(() => error);
    })
  );
};
