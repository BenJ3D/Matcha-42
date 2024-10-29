import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from '../services/auth.guard';

export const routes: Routes = [
  {
    path: 'callback/verify-email',
    loadComponent: () => import('../callback/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent), canActivate: [authGuard] },
      { path: 'nearby', loadComponent: () => import('./nearby/nearby.component').then(m => m.NearbyComponent), canActivate: [authGuard] },
      { path: 'chat', loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent), canActivate: [authGuard] },
      { path: 'notification', loadComponent: () => import('./notification/notification.component').then(m => m.NotificationComponent), canActivate: [authGuard] },
      { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./edit-profile/edit-profile.component').then((m) => m.EditProfileComponent),
    canActivate: [authGuard]
  },
];