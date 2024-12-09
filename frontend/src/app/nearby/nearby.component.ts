import {HttpParams} from '@angular/common/http';
import {ProfileService} from './../../services/profile.service';
import {Component, OnInit, PLATFORM_ID, Inject} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import * as L from 'leaflet';

interface NearbyUser {
  id: number;
  name: string;
  age: number;
  lat: number;
  lng: number;
  main_photo_url?: string;
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
  private currentPosition: any = {lat: 0, lng: 0};

  nearbyUsers: NearbyUser[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private profileService: ProfileService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.profileService.getMyProfile().subscribe((user) => {
        this.currentPosition = {lat: user.location?.latitude, lng: user.location?.longitude};
        this.map.setView([this.currentPosition.lat, this.currentPosition.lng], 13);
        this.addCurrentPositionMarker(); // Appel ici seulement
      });
      this.fetchUsers();
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView([this.currentPosition.lat, this.currentPosition.lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // this.addCurrentPositionMarker();
    this.addNearbyUsersMarkers();
  }

  private addCurrentPositionMarker(): void {
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: "<mat-icon class='material-icons' style='color: #3388ff;'>place</mat-icon>",
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });

    L.marker([this.currentPosition.lat, this.currentPosition.lng], {icon: icon})
      .addTo(this.map)
      .bindPopup('You are here')
      .openPopup();
  }

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
          main_photo_url: user.main_photo_url,
          location: {
            latitude: user.location.latitude,
            longitude: user.location.longitude,
            city_name: user.location.city_name
          }
        }));

      this.addNearbyUsersMarkers();
    });
  }

  private addNearbyUsersMarkers(): void {
    this.nearbyUsers.forEach(user => {
      if (user.lat && user.lng) {
        const customIcon = L.divIcon({
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

        const marker = L.marker([user.lat, user.lng], {icon: customIcon})
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

        marker.on('click', () => {
          this.router.navigate(['/profile'], {queryParams: {id: user.id}});
        });
      }
    });
  }
}
