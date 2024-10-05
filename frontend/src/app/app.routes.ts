import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
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
    children: [
      { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
      { path: 'nearby', loadComponent: () => import('./nearby/nearby.component').then(m => m.NearbyComponent) },
      { path: 'chat', loadComponent: () => import('./chat/chat.component').then(m => m.ChatComponent) },
      // { path: 'notifications', loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent) },
      // { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];