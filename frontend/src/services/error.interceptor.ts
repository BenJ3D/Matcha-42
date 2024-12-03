import {HttpInterceptorFn} from '@angular/common/http';
import {inject, Injector} from '@angular/core';
import {ToastService} from './toast.service';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {AuthService} from "./auth.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const injector = inject(Injector); // Inject the injector here, instead of directly injecting AuthService

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && error.error?.error === 'Non autorisé : email utilisateur non vérifié') {
        const authService = injector.get(AuthService);
        console.log('Erreur de vérification d\'email détectée.');

        toastService.showWithAction(
          'Your email has not been verified.',
          'Resend',
          () => authService.resendVerificationEmail().subscribe({
            next: () => toastService.show('Verification email resent successfully.', 'Close'),
            error: (err) => toastService.show('Error resending the email.', 'Close')
          })
        );
      } else if (error.status >= 400 && error.status < 500) {
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
