import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import {CommonModule} from "@angular/common";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {Router} from "@angular/router";
import {NotificationsReceiveDto} from "../../DTOs/notifications/NotificationsReceiveDto"; // Assurez-vous de définir ce DTO

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: NotificationsReceiveDto[] = [];
  private notificationSubscription!: Subscription;

  constructor(private socketService: SocketService, private router: Router) {}

  ngOnInit(): void {
    // Écouter les notifications en temps réel
    this.notificationSubscription = this.socketService.on<NotificationsReceiveDto>('notification').subscribe((notification) => {
      this.notifications.unshift(notification); // Ajouter en haut de la liste
    });
  }

  onNotificationClick(notification: NotificationsReceiveDto): void {
    if (!notification.has_read) {
      notification.has_read = true;
      // Émettre un événement pour notifier le serveur que la notification a été lue
      this.socketService.emit('notification read', { id: notification.notification_id });
    }
    this.navigateToRelevantPage(notification);
  }

  navigateToRelevantPage(notification: NotificationsReceiveDto): void {
    // Implémenter la navigation en fonction du type de notification
    switch (notification.type) {
      case 'LIKE':
      case 'UNLIKE':
      case 'MATCH':
      case 'NEW_MESSAGE':
        this.router.navigate(['/chat', notification.notification_id]);
        break;
      case 'NEW_VISIT':

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

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
