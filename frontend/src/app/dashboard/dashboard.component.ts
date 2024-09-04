import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatTabsModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  tabs = [
    { path: 'home', icon: 'home', label: 'Home' },
    { path: 'nearby', icon: 'near_me', label: 'Nearby' },
    { path: 'chats', icon: 'chat', label: 'Chats' },
    { path: 'notifications', icon: 'notifications', label: 'Notifications' },
    { path: 'profile', icon: 'person', label: 'Profile' }
  ];
}