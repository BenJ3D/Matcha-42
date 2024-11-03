import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  PLATFORM_ID,
  Inject, OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface UserProfile {
  id: number;
  username: string;
  main_photo_url: string | null;
  age: number | null;
  gender: number | null;
  location?: {
    latitude: number;
    longitude: number;
    city_name: string;
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild('swipeCard') swipeCard!: ElementRef;

  currentProfileIndex: number = 0;
  animateRight: Boolean = false;
  animateLeft: Boolean = false;
  profiles: UserProfile[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router
  ) {}

  get currentProfile(): UserProfile {
    return this.profiles[this.currentProfileIndex];
  }

  ngOnInit() {
    this.fetchProfiles();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSwipeGesture();
    }
  }

  fetchProfiles() {
    this.http.get<UserProfile[]>('http://localhost:8000/api/users/search').subscribe({
      next: (profiles) => {
        console.log('Profils reçus de l\'API :', profiles);
        this.profiles = profiles.map((profile: any) => ({
          id: profile.id,
          username: profile.username || 'Anonymous',
          main_photo_url: profile.main_photo_url || 'https://example.com/default-photo.jpg',
          location: profile.location || {city_name: 'Unknown City', latitude: 0, longitude: 0},
          age: profile.age || 'Unknown',
          gender: profile.gender || 'Unknown'
        }));
        console.log('Profils après mapping:', this.profiles);
      },
      error: (error) => {
        // if (error.error?.error == 'Profil non trouvé') {
        //   this.router.navigate(['/profile'])
        // }
        console.error('Erreur lors de la récupération des profils:', error);
      }
    });
  }

  async initSwipeGesture() {
    if (isPlatformBrowser(this.platformId) && this.swipeCard?.nativeElement) {
      const Hammer = (await import('hammerjs')).default;
      const hammer = new Hammer(this.swipeCard.nativeElement);
      hammer.on('swipeleft swiperight', (event: any) => {
        this.onSwipe(event.type === 'swiperight');
      });
    } else {
      console.warn('Swipe card element is not available.');
    }
  }

  onSwipe(liked: boolean) {
    if (liked) {
      console.log('Liked profile:', this.currentProfile.username);
      this.animateRight = true;
    } else {
      console.log('Passed profile:', this.currentProfile.username);
      this.animateLeft = true;
    }

    setTimeout(() => {
      this.nextProfile();
      this.resetAnimations();
    }, 500);
  }

  nextProfile() {
    this.currentProfileIndex =
      (this.currentProfileIndex + 1) % this.profiles.length;
  }

  resetAnimations() {
    this.animateRight = false;
    this.animateLeft = false;
  }

  onLikeClick() {
    this.onSwipe(true);
  }

  onPassClick() {
    this.onSwipe(false);
  }
}
