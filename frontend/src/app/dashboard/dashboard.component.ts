import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge'; // Import MatBadgeModule
import { SocketService } from "../../services/socket.service";
import { async, BehaviorSubject, filter, Subscription } from 'rxjs';
import { NotificationsReceiveDto } from "../../DTOs/notifications/NotificationsReceiveDto";
import { ApiService } from "../../services/api.service";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatTabsModule,
    MatIconModule,
    MatBadgeModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  tabs = [
    { path: 'home', icon: 'home', label: 'Home' },
    { path: 'nearby', icon: 'near_me', label: 'Nearby' },
    { path: 'chat', icon: 'chat', label: 'Chat' },
    { path: 'notification', icon: 'notifications', label: 'Notifications' },
    { path: 'profile', icon: 'person', label: 'Profile' }
  ];
  protected readonly async = async;
  private intervalId!: NodeJS.Timeout;

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
    private router: Router,
    private ngZone: NgZone,
  ) {

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.fetchNotification();
        this.fetchChatUnread();
      }, 500);
    })

  }

  ngOnInit(): void {
    const notificationSub = this.socketService.on<NotificationsReceiveDto>('notification').subscribe(notification => {
      this.fetchNotification();
    });
    this.subscriptions.add(notificationSub);

    const fetchNotificationsSub = this.socketService.on('fetch_notifications').subscribe(() => {
      this.fetchNotification();
    });
    this.subscriptions.add(fetchNotificationsSub);

    const fetchMessagesSub = this.socketService.on('fetch_messages').subscribe(() => {
      this._unreadChatMarker$.next(true);
    });
    this.subscriptions.add(fetchMessagesSub);

    this.fetchNotification();
    this.fetchChatUnread();

    const routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.fetchNotification();
      const currentPath = event.urlAfterRedirects.split('/')[1];
      if (currentPath === 'chat') {
      }
    });
    this.subscriptions.add(routerSub);
    localStorage.removeItem('resendToken');

  }

  fetchNotification(): void {
    this.apiService.get<NotificationsReceiveDto[]>('notifications?includeRead=false').subscribe({
      next: (notifications: string | any[]) => {
        const count = notifications.length;
        this._countNotificationMarker$.next(count);
        this._notificationMarker$.next(count > 0);
      },
    });
  }

  fetchChatUnread(): void {
    this.apiService.get<{ unreadMessages: number[] }>('unread-messages').subscribe({
      next: (userIds: { unreadMessages: number[] }) => {
        const count = userIds.unreadMessages.length;
        this._countChatUnreadMarker$.next(count);
        this._unreadChatMarker$.next(count > 0);
        this._unreadChatIdsMarker$.next(userIds.unreadMessages);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    clearInterval(this.intervalId);
  }
}
