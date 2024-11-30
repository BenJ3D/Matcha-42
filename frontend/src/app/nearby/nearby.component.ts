import { HttpParams } from '@angular/common/http';
import { ProfileService } from './../../services/profile.service';
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UserResponseDto } from '../../DTOs/users/UserResponseDto';
import {Router} from '@angular/router';

interface NearbyUser {
  id: number;
  name: string;
  age: number;
  lat: number;
  lng: number;
  main_photo_url?: string; // Add this property
  location: {
    latitude: number;
    longitude: number;
    city_name?: string;
  };
}

@Component({
  selector: 'app-nearby',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './nearby.component.html',
  styleUrls: ['./nearby.component.scss']
})
export class NearbyComponent implements OnInit {
  private map: any;
  private L: any;
  private currentPosition: any = { lat: 0, lng: 0 };

  nearbyUsers: NearbyUser[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object,
  private profileService: ProfileService, private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
      this.profileService.getMyProfile().subscribe((user) => {
        this.currentPosition = { lat: user.location?.latitude, lng: user.location?.longitude };
        console.log('Current position:', this.currentPosition);
        this.initMap(); // Initialize map after getting the position
      });
      this.fetchUsers();
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
    // this.generateNearbyUsers();
    this.addNearbyUsersMarkers();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currentPosition = { lat: position.coords.latitude, lng: position.coords.longitude };
        this.map.setView([this.currentPosition.lat, this.currentPosition.lng], 13);
        this.addCurrentPositionMarker();
        // this.generateNearbyUsers();
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

  // private generateNearbyUsers(): void {
  //   // Generate 5 random users within approximately 5km of the current position
  //   const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan'];
  //   this.nearbyUsers = [];
  //   for (let i = 0; i < 5; i++) {
  //     const lat = this.currentPosition.lat + (Math.random() - 0.5) * 0.05;
  //     const lng = this.currentPosition.lng + (Math.random() - 0.5) * 0.05;
  //     this.nearbyUsers.push({
  //       id: i + 1,
  //       name: names[i],
  //       age: 20 + Math.floor(Math.random() * 20),
  //       lat: lat,
  //       lng: lng
  //     });
  //   }
  //   console.log('Generated nearby users:', this.nearbyUsers);
  // }

  private fetchUsers(): void {
    let params = new HttpParams();
    this.profileService.searchProfiles(params).subscribe((users) => {
      this.nearbyUsers = users
        .filter((user): user is (typeof user & { location: NonNullable<typeof user.location> }) => 
          !!user.location?.latitude && !!user.location?.longitude
        )
        .map((user) => ({
          id: user.id,
          name: user.username,
          age: user.age,
          lat: user.location.latitude,
          lng: user.location.longitude,
          main_photo_url: user.main_photo_url, // Add this field
          location: {
            latitude: user.location.latitude,
            longitude: user.location.longitude,
            city_name: user.location.city_name
          }
        }));
      
      this.addNearbyUsersMarkers();
      console.log('Fetched nearby users:', this.nearbyUsers);
    });
  }
  
  private addNearbyUsersMarkers(): void {
    this.nearbyUsers.forEach(user => {
      if (user.lat && user.lng) {
        // Create custom marker icon with profile photo
        const customIcon = this.L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="marker-content" title="${user.name}, ${user.age}">
              <img src="${user.main_photo_url || 'assets/images/default-profile.webp'}" 
                   alt="${user.name}" 
                   class="profile-marker-img"/>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        });
  
        // Create marker with popup
        const marker = this.L.marker([user.lat, user.lng], { icon: customIcon })
          .addTo(this.map)
          .bindPopup(`
            <div class="marker-popup">
              <img src="${user.main_photo_url || 'assets/images/default-profile.webp'}" 
                   alt="${user.name}" 
                   class="popup-img"/>
              <div class="popup-content">
                <strong>${user.name}</strong>, ${user.age}<br>
                ${user.location?.city_name || ''}
              </div>
              <button class="view-profile-btn" 
                      onclick="window.dispatchEvent(new CustomEvent('viewProfile', 
                      {detail: ${user.id}}))">
                View Profile
              </button>
            </div>
          `, {
            className: 'custom-popup'
          });
  
        // Handle profile navigation
        marker.on('click', () => {
          this.router.navigate(['/profile'], { queryParams: { id: user.id } });
        });
      }
    });
  }
}