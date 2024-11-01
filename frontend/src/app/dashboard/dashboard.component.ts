import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterModule, RouterOutlet} from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge'; // Import MatBadgeModule
import {SocketService} from "../../services/socket.service";
import {filter, Subscription} from 'rxjs';
import {NotificationsReceiveDto} from "../../DTOs/notifications/NotificationsReceiveDto";
import {BehaviorSubject} from 'rxjs';
import {ApiService} from "../../services/api.service";
import {NotificationType} from "../../models/Notifications";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatTabsModule,
    MatIconModule,
    MatBadgeModule // Ajoute MatBadgeModule ici
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

  // Utilisation de BehaviorSubject pour gérer l'état réactif
  private _countNotificationMarker$ = new BehaviorSubject<number>(0);
  countNotificationMarker$ = this._countNotificationMarker$.asObservable();

  private _notificationMarker$ = new BehaviorSubject<boolean>(false);
  notificationMarker$ = this._notificationMarker$.asObservable();

  private _messageMarker$ = new BehaviorSubject<boolean>(false);
  messageMarker$ = this._messageMarker$.asObservable();

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    // Abonnement aux notifications en temps réel
    const notificationSub = this.socketService.on<NotificationsReceiveDto>('notification').subscribe(notification => {
      if (notification.type === NotificationType.NEW_MESSAGE) {
        this._messageMarker$.next(true);
      }
      this.fetchNotification();
    });
    this.subscriptions.add(notificationSub);

    // Abonnement pour rafraîchir la liste des notifications
    const fetchNotificationsSub = this.socketService.on('fetch_notifications').subscribe(() => {
      this.fetchNotification();
    });
    this.subscriptions.add(fetchNotificationsSub);

    // Abonnement pour les nouveaux messages
    const fetchMessagesSub = this.socketService.on('fetch_messages').subscribe(() => {
      this._messageMarker$.next(true);
    });
    this.subscriptions.add(fetchMessagesSub);

    // Récupérer les notifications initiales
    this.fetchNotification();

    // Réinitialiser les marqueurs lors de la navigation
    const routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.fetchNotification();
      const currentPath = event.urlAfterRedirects.split('/')[1];
      if (currentPath === 'chat') {
        this._messageMarker$.next(false);
      }
    });
    this.subscriptions.add(routerSub);
  }

  /**
   * Récupère la liste des notifications non lues
   */
  fetchNotification(): void {
    this.apiService.get<NotificationsReceiveDto[]>('notifications?includeRead=false').subscribe({
      next: (notifications: string | any[]) => {
        console.warn('RET : ', notifications.length);
        const count = notifications.length;
        this._countNotificationMarker$.next(count);
        this._notificationMarker$.next(count > 0);
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération des notifications :', error);
      },
    });
  }

  ngOnDestroy(): void {
    // Désabonner tous les abonnements pour éviter les fuites de mémoire
    this.subscriptions.unsubscribe();
  }
}
