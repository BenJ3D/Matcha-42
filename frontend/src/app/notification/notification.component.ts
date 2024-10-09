import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
})
export class NotificationComponent implements OnInit {
  notifications = [
    {
      id: '1',
      type: 'like',
      description: 'John Doe liked your profile.',
      read: false,
      fromUserId: 'user123',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'message',
      description: 'Jane Smith sent you a message.',
      read: false,
      fromUserId: 'user456',
      timestamp: new Date(),
    },
    // Add more notifications as needed
  ];

  unreadCount = this.notifications.filter((n) => !n.read).length;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  onNotificationClick(notification: any) {
    if (!notification.read) {
      notification.read = true;
      this.unreadCount--;
    }
    this.navigateToRelevantPage(notification);
  }

  navigateToRelevantPage(notification: any) {
    switch (notification.type) {
      case 'like':
      case 'mutual_like':
      case 'unlike':
      case 'profile_view':
        this.router.navigate(['/profile', notification.fromUserId]);
        break;
      case 'message':
        this.router.navigate(['/chat', notification.fromUserId]);
        break;
      default:
        break;
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'like':
      case 'mutual_like':
        return 'favorite';
      case 'unlike':
        return 'favorite_border';
      case 'profile_view':
        return 'visibility';
      case 'message':
        return 'chat';
      default:
        return 'notifications';
    }
  }
}
