import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { ToastService } from './toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {AuthService} from "./auth.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error) => {
      const authService = injector.get(AuthService);
      if (error.status === 401 && error.error?.error === 'Non autorisé : email utilisateur non vérifié') {
        console.log('Erreur de vérification d\'email détectée.');
        toastService.showWithAction(
          'Votre email n\'a pas été vérifié.',
          'Resend',
          () => authService.resendVerificationEmail().subscribe({
            next: () => toastService.show('Email de vérification renvoyé avec succès.', 'Close'),
            error: (err) => toastService.show('Erreur lors du renvoi de l\'email.', 'Close')
          })
        );
      } else if (error.status >= 400 && error.status < 500) {
        const errorMessage =
          error.error?.error ||
          error.error?.message ||
          error.message ||
          'Une erreur inattendue est survenue.';
        toastService.show(errorMessage, 'Fermer');
      }
      return throwError(() => error);
    })
  );
};
