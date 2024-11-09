import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterModule, RouterOutlet} from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge'; // Import MatBadgeModule
import {SocketService} from "../../services/socket.service";
import {async, BehaviorSubject, filter, Subscription} from 'rxjs';
import {NotificationsReceiveDto} from "../../DTOs/notifications/NotificationsReceiveDto";
import {ApiService} from "../../services/api.service";

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
  tabs = [
    {path: 'home', icon: 'home', label: 'Home'},
    {path: 'nearby', icon: 'near_me', label: 'Nearby'},
    {path: 'chat', icon: 'chat', label: 'Chat'},
    {path: 'notification', icon: 'notifications', label: 'Notifications'},
    {path: 'profile', icon: 'person', label: 'Profile'}
  ];
  protected readonly async = async;
  private intervalId: NodeJS.Timeout;

  // Utilisation de BehaviorSubject pour gérer l'état réactif
  private _countNotificationMarker$ = new BehaviorSubject<number>(0);
  countNotificationMarker$ = this._countNotificationMarker$.asObservable();

  private _notificationMarker$ = new BehaviorSubject<boolean>(false);
  notificationMarker$ = this._notificationMarker$.asObservable();

  private _countChatUnreadMarker$ = new BehaviorSubject<number>(0);
  countChatUnreadMarker$ = this._countChatUnreadMarker$.asObservable();

  private _unreadChatMarker$ = new BehaviorSubject<boolean>(false);
  unreadChatMarker$ = this._unreadChatMarker$.asObservable();

  private _unreadChatIdsMarker$ = new BehaviorSubject<number[]>([]);
  unreadChatIdsMarker$ = this._unreadChatIdsMarker$.asObservable();

  private subscriptions: Subscription = new Subscription();

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.intervalId = setInterval(() => {
      this.fetchNotification();
      this.fetchChatUnread();
    }, 3000);

  }

  ngOnInit(): void {
    // Abonnement aux notifications en temps réel
    const notificationSub = this.socketService.on<NotificationsReceiveDto>('notification').subscribe(notification => {
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
      this._unreadChatMarker$.next(true);
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
        const count = notifications.length;
        this._countNotificationMarker$.next(count);
        this._notificationMarker$.next(count > 0);
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération des notifications :', error);
      },
    });
  }

  /**
   * Récupère la liste des notifications non lues
   */
  fetchChatUnread(): void {
    this.apiService.get<{ unreadMessages: number[] }>('unread-messages').subscribe({
      next: (userIds: { unreadMessages: number[] }) => {
        const count = userIds.unreadMessages.length;
        this._countChatUnreadMarker$.next(count);
        this._unreadChatMarker$.next(count > 0);
        this._unreadChatIdsMarker$.next(userIds.unreadMessages);
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération des notifications :', error);
      },
    });
  }

  ngOnDestroy(): void {
    // Désabonner tous les abonnements pour éviter les fuites de mémoire
    this.subscriptions.unsubscribe();
    clearInterval(this.intervalId);
  }
}
