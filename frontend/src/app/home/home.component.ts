import { Component, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface UserProfile {
  id: number;
  name: string;
  age: number;
  bio: string;
  imageUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('swipeCard') swipeCard!: ElementRef;

  currentProfileIndex = 0;
  animateRight = false;
  animateLeft = false;

  // Mock
  profiles: UserProfile[] = [
    {
      id: 1,
      name: 'Alice',
      age: 28,
      bio: 'Love traveling and photography',
      imageUrl: 'https://thispersondoesnotexist.com/',
    },
    {
      id: 2,
      name: 'Bob',
      age: 32,
      bio: 'Foodie and fitness enthusiast',
      imageUrl: 'https://thispersondoesnotexist.com/',
    },
    {
      id: 3,
      name: 'Charlie',
      age: 25,
      bio: 'Musician and coffee lover',
      imageUrl: 'https://thispersondoesnotexist.com/',
    },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get currentProfile(): UserProfile {
    return this.profiles[this.currentProfileIndex];
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initSwipeGesture();
    }
  }

  async initSwipeGesture() {
    if (isPlatformBrowser(this.platformId)) {
      const Hammer = (await import('hammerjs')).default;
      const hammer = new Hammer(this.swipeCard.nativeElement);
      hammer.on('swipeleft swiperight', (event: any) => {
        this.onSwipe(event.type === 'swiperight');
      });
    }
  }

  onSwipe(liked: boolean) {
    if (liked) {
      console.log('Liked profile:', this.currentProfile.name);
      this.animateRight = true;
    } else {
      console.log('Passed profile:', this.currentProfile.name);
      this.animateLeft = true;
    }

    setTimeout(() => {
      this.nextProfile();
      this.resetAnimations();
    }, 500);
  }

  nextProfile() {
    this.currentProfileIndex = (this.currentProfileIndex + 1) % this.profiles.length;
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