import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../services/auth.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { errorInterceptor } from "../services/error.interceptor";
import { AuthService } from "../services/auth.service";

export function initializeApp(authService: AuthService) {
  return (): Promise<void> => {
    return new Promise((resolve) => {
      authService.initUser();
      resolve();
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    importProvidersFrom([
      MatButtonModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      MatSnackBarModule,
    ]),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AuthService],
      multi: true,
    },
  ],
};
