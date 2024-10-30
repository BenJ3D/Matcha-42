import {Component, OnInit, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {SocketService} from '../../services/socket.service';
import {CommonModule} from "@angular/common";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {Router} from "@angular/router";
import {NotificationsReceiveDto} from "../../DTOs/notifications/NotificationsReceiveDto";
import {UserLightResponseDto} from "../../DTOs/users/UserLightResponseDto";
import {HttpClient} from "@angular/common/http";
import {NotificationType} from "../../models/Notifications";
import {MatTooltip} from "@angular/material/tooltip";
import {MatCardHeader, MatCardModule, MatCardTitle} from "@angular/material/card";

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
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    // Écouter les notifications en temps réel
    this.notificationSubscription = this.socketService.on<NotificationsReceiveDto>('notification').subscribe((notification) => {
      this.notifications.unshift(notification); // Ajouter en haut de la liste
    });
    this.socketService.on('fetch_notifications').subscribe(() => {
      console.log("COUCOUUUU CEST FETCH NOTIFICATIONNNN");
      this.fetchNotification();
    });
    this.fetchNotification();
  }

  onNotificationClick(notification: NotificationsReceiveDto): void {
    console.log(notification);
    if (!notification.has_read) {
      this.socketService.emit('notification_read', {data: [notification.notification_id]});
    }
    this.navigateToRelevantPage(notification);
  }


  deleteNotification(notification: NotificationsReceiveDto): void {
    this.socketService.emit('notification_delete', {data: notification.notification_id});
  }

  navigateToRelevantPage(notification: NotificationsReceiveDto): void {
    // Implémenter la navigation en fonction du type de notification
    switch (notification.type) {
      case 'LIKE':
        this.router.navigate(['/profile'], {queryParams: {id: notification.source_user}});
        break;
      case 'UNLIKE':
        this.router.navigate(['/profile'], {queryParams: {id: notification.source_user}});
        break;
      case 'MATCH':
        console.log('POURQUOI ?????', notification.type);
        this.router.navigate(['/chat'], {queryParams: {id: notification.source_user}});
        break;
      case 'NEW_MESSAGE':
        console.log('Naviguer vers /chat avec id :', notification.source_user);
        this.router.navigate(['/chat'], {queryParams: {id: notification.source_user}});
        break;
      case 'NEW_VISIT':
        this.router.navigate(['/profile'], {queryParams: {id: notification.source_user}});
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
        return 'You have new match !';
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
   * Récupère la liste des utilisateurs avec qui l'utilisateur est en match.
   */
  fetchNotification(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<NotificationsReceiveDto[]>('http://localhost:8000/api/notifications?includeRead=true').subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.cdr.detectChanges();
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des matches:', error);
          reject(error);
        },
      });
    });
  }

  /**
   * Like un user en retour d'un like.
   */
  likingBack(notification: NotificationsReceiveDto): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post(`http://localhost:8000/api/likes/${notification.source_user}`, {}).subscribe({
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


  likingBack2(notification: NotificationsReceiveDto): void {
    console.log(notification);
    if (!notification.has_read) {
      this.socketService.emit('notification_read', {data: [notification.notification_id]});
    }
  }

}
