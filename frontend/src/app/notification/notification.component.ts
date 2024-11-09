import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {SocketService} from '../../services/socket.service';
import {CommonModule} from "@angular/common";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {Router} from "@angular/router";
import {NotificationsReceiveDto} from "../../DTOs/notifications/NotificationsReceiveDto";
import {NotificationType} from "../../models/Notifications";
import {MatTooltip} from "@angular/material/tooltip";
import {MatCardModule} from "@angular/material/card";
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatTooltip,
    MatCardModule,
  ],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: NotificationsReceiveDto[] = [];
  private notificationSubscription!: Subscription;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    // Écouter les notifications en temps réel
    this.notificationSubscription = this.socketService.on<NotificationsReceiveDto>('notification').subscribe((notification) => {
      this.notifications.unshift(notification); // Ajouter en haut de la liste
    });

    this.socketService.on('fetch_notifications').subscribe(() => { // Rafraîchir la liste après suppression d'une notification
      this.fetchNotification();
    });

    this.fetchNotification();
  }

  onNotificationClick(notification: NotificationsReceiveDto): void {
    console.log(notification);
    this.readNotification(notification);
    this.navigateToRelevantPage(notification);
  }

  readNotification(notification: NotificationsReceiveDto): void {
    if (!notification.has_read) {
      this.socketService.emit('notification_read', {data: [notification.notification_id]});
    }
    if (notification.type == NotificationType.NEW_MESSAGE) {
      this.socketService.emit('conversation_read', {data: notification.source_user});
      // Mettre à jour l'état local
      notification.has_read = true;
      this.cdr.detectChanges();
    }
  }

  readAllNotifications(): void {
    const unreadIds = this.notifications
      .filter(notification => !notification.has_read)
      .map(notification => notification.notification_id);

    if (unreadIds.length > 0) {
      this.socketService.emit('notification_read', {data: unreadIds});
      // Mettre à jour l'état local
      this.notifications.forEach(notification => {
        if (!notification.has_read) {
          notification.has_read = true;
        }
      });
      this.cdr.detectChanges();
    }
  }

  hasUnreadNotification(): boolean {
    return this.notifications.some(notification => !notification.has_read)
  }

  hasNotifications(): boolean {
    return this.notifications.length > 0;
  }

  deleteNotification(notification: NotificationsReceiveDto): void {
    this.socketService.emit('notifications_delete', {data: [notification.notification_id]});
  }

  deleteAllNotifications(): void {
    const unreadIds = this.notifications
      .map(notification => notification.notification_id);

    if (unreadIds.length > 0) {
      this.socketService.emit('notifications_delete', {data: unreadIds});
      // Mettre à jour l'état local
      this.notifications.forEach(notification => {
        if (!notification.has_read) {
          notification.has_read = true;
        }
      });
      this.cdr.detectChanges();
    }
  }

  navigateToRelevantPage(notification: NotificationsReceiveDto): void {
    // Implémenter la navigation en fonction du type de notification
    switch (notification.type) {
      case 'LIKE':
      case 'UNLIKE':
      case 'NEW_VISIT':
        this.router.navigate(['/profile'], {queryParams: {id: notification.source_user}});
        break;
      case 'MATCH':
      case 'NEW_MESSAGE':
        console.log('Naviguer vers /chat avec id :', notification.source_user);
        this.router.navigate(['/chat'], {queryParams: {id: notification.source_user}});
        break;
      default:
        break;
    }
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'LIKE':
      case 'MATCH':
        return 'favorite';
      case 'UNLIKE':
        return 'favorite_border';
      case 'NEW_VISIT':
        return 'visibility';
      case 'NEW_MESSAGE':
        return 'chat';
      default:
        return 'notifications';
    }
  }

  getNotificationMessage(type: NotificationType): string {
    switch (type) {
      case 'LIKE':
        return 'liked you';
      case 'MATCH':
        return 'You have a new match!';
      case 'UNLIKE':
        return 'unliked you';
      case 'NEW_VISIT':
        return 'visited your profile';
      case 'NEW_MESSAGE':
        return 'sent you a new message';
      default:
        return 'notifications';
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  /**
   * Récupère la liste des notifications
   */
  fetchNotification(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<NotificationsReceiveDto[]>('notifications?includeRead=true').subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.cdr.detectChanges();
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des notifications:', error);
          reject(error);
        },
      });
    });
  }

  /**
   * Like un utilisateur en retour d'un like.
   */
  likingBack(notification: NotificationsReceiveDto): Promise<void> {
    return new Promise((resolve, reject) => {
      this.readNotification(notification);
      this.apiService.post(`likes/${notification.source_user}`, {}).subscribe({
        next: () => {
          resolve();
        },
        error: (error) => {
          console.warn('Erreur lors du like:', error);
          reject(error);
        },
      });
    });
  }
}
