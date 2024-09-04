import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface NearbyUser {
  id: number;
  name: string;
  age: number;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-nearby',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './nearby.component.html',
  styleUrls: ['./nearby.component.scss']
})
export class NearbyComponent implements OnInit, AfterViewInit {
  private map: any;
  private L: any;
  private currentPosition: any = { lat: 48.198850, lng: 6.351160 }; // Your current location

  nearbyUsers: NearbyUser[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  private async loadLeaflet(): Promise<void> {
    if (!this.L) {
      this.L = await import('leaflet');
    }
  }

  private async initMap(): Promise<void> {
    await this.loadLeaflet();
    
    this.map = this.L.map('map').setView([this.currentPosition.lat, this.currentPosition.lng], 13);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addCurrentPositionMarker();
    this.generateNearbyUsers();
    this.addNearbyUsersMarkers();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        this.map.setView([this.currentPosition.lat, this.currentPosition.lng], 13);
        this.addCurrentPositionMarker();
        this.generateNearbyUsers();
        this.addNearbyUsersMarkers();
      });
    }
  }

  private addCurrentPositionMarker(): void {
    const icon = this.L.divIcon({
      className: 'custom-div-icon',
      html: "<mat-icon class='material-icons' style='color: #3388ff;'>place</mat-icon>",
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    this.L.marker([this.currentPosition.lat, this.currentPosition.lng], { icon: icon })
      .addTo(this.map)
      .bindPopup('You are here')
      .openPopup();
  }

  private generateNearbyUsers(): void {
    // Generate 5 random users within approximately 5km of the current position
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan'];
    this.nearbyUsers = [];
    for (let i = 0; i < 5; i++) {
      const lat = this.currentPosition.lat + (Math.random() - 0.5) * 0.05;
      const lng = this.currentPosition.lng + (Math.random() - 0.5) * 0.05;
      this.nearbyUsers.push({
        id: i + 1,
        name: names[i],
        age: 20 + Math.floor(Math.random() * 20),
        lat: lat,
        lng: lng
      });
    }
    console.log('Generated nearby users:', this.nearbyUsers);
  }

  private addNearbyUsersMarkers(): void {
    this.nearbyUsers.forEach(user => {
      const icon = this.L.divIcon({
        className: 'custom-div-icon',
        html: "<mat-icon class='material-icons' style='color: #ff3366;'>person_pin</mat-icon>",
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });

      this.L.marker([user.lat, user.lng], { icon: icon })
        .addTo(this.map)
        .bindPopup(`${user.name}, ${user.age}`);
    });
  }
}