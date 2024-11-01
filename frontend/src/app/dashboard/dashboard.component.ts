import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, RouterOutlet, Router, NavigationEnd} from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge'; // Import MatBadgeModule
import {SocketService} from "../../services/socket.service";
import {filter} from 'rxjs/operators';
import {ApiService} from "../../services/api.service";
import {NotificationsReceiveDto} from "../../DTOs/notifications/NotificationsReceiveDto";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatTabsModule,
    MatIconModule,
    MatBadgeModule // Ajoutez MatBadgeModule ici
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private router: Router
  ) {
  }

  tabs = [
    {path: 'home', icon: 'home', label: 'Home'},
    {path: 'nearby', icon: 'near_me', label: 'Nearby'},
    {path: 'chat', icon: 'chat', label: 'Chat'},
    {path: 'notification', icon: 'notifications', label: 'Notifications'},
    {path: 'profile', icon: 'person', label: 'Profile'}
  ];

  protected notificationMarker: boolean = false;
  protected countNotificationMarker: number = 0;
  protected messageMarker: boolean = false;

  private routerSubscription: any;

  ngOnInit(): void {
    this.socketService.on<NotificationsReceiveDto>('notification').subscribe(() => {
      this.fetchNotification();
    });
    this.socketService.on('fetch_notifications').subscribe(() => {
      this.fetchNotification();
    });

    this.socketService.on('fetch_messages').subscribe(() => {
      this.messageMarker = true;
    });

    this.fetchNotification();

    // Réinitialiser les marqueurs lors de la navigation
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentPath = event.urlAfterRedirects.split('/')[1];
      if (currentPath === 'chat') {
        this.messageMarker = false;
      }
    });
  }


  /**
   * Récupère la liste des notifications
   */
  fetchNotification(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<NotificationsReceiveDto[]>('notifications?includeRead=false').subscribe({
        next: (notifications) => {
          this.countNotificationMarker = notifications.length;
          if (this.countNotificationMarker > 0) {
            this.notificationMarker = true;
          } else {
            this.notificationMarker = false;
          }
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des matches:', error);
          reject(error);
        },
      });
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
