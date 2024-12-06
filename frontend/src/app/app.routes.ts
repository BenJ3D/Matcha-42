import {Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {authGuard} from '../services/auth.guard';
import {ProfileGuard} from '../services/profile.guard';

export const routes: Routes = [
  {
    path: 'callback/verify-email',
    loadComponent: () =>
      import('../callback/verify-email/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  }, {
    path: 'callback/password-reset',
    loadComponent: () =>
      import('../callback/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {path: '', redirectTo: 'home', pathMatch: 'full'},
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
        canActivate: [authGuard, ProfileGuard],
      },
      {
        path: 'nearby',
        loadComponent: () =>
          import('./nearby/nearby.component').then((m) => m.NearbyComponent),
        canActivate: [authGuard, ProfileGuard],
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./chat/chat.component').then((m) => m.ChatComponent),
        canActivate: [authGuard, ProfileGuard],
      },
      {
        path: 'notification',
        loadComponent: () =>
          import('./notification/notification.component').then(
            (m) => m.NotificationComponent
          ),
        canActivate: [authGuard, ProfileGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./profile/profile.component').then((m) => m.ProfileComponent),
        canActivate: [authGuard, ProfileGuard],
      },
    ],
  },
  {
    path: 'create-profile',
    loadComponent: () =>
      import('./profile/create-profile/create-profile.component').then(
        (m) => {
          return m.CreateProfileComponent;
        }
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./page-not-found/page-not-found.component').then(
        (m) => m.PageNotFoundComponent
      ),
  },
];
