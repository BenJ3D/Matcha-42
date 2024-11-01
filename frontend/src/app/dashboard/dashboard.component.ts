import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, RouterOutlet, Router, NavigationEnd} from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge'; // Import MatBadgeModule
import {SocketService} from "../../services/socket.service";
import {filter} from 'rxjs/operators';

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
    private router: Router // Injectez le Router
  ) {
  }

  tabs = [
    {path: 'home', icon: 'home', label: 'Home'},
    {path: 'nearby', icon: 'near_me', label: 'Nearby'},
    {path: 'chat', icon: 'chat', label: 'Chat'},
    {path: 'notification', icon: 'notifications', label: 'Notifications'},
    {path: 'profile', icon: 'person', label: 'Profile'}
  ];

  protected notificationMarker: boolean = true;
  protected messageMarker: boolean = true;

  private routerSubscription: any;

  ngOnInit(): void {
    this.socketService.on('fetch_notifications').subscribe(() => {
      this.notificationMarker = true;
    });
    this.socketService.on('fetch_messages').subscribe(() => {
      this.messageMarker = true;
    });

    // Réinitialiser les marqueurs lors de la navigation
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const currentPath = event.urlAfterRedirects.split('/')[1];
      if (currentPath === 'notification') {
        this.notificationMarker = false;
      }
      if (currentPath === 'chat') {
        this.messageMarker = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
