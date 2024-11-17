import { Component, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild('swipeCard') swipeCard!: ElementRef;

  currentProfileIndex: number = 0;
  animateRight: boolean = false;
  animateLeft: boolean = false;
  profiles: UserProfile[] = [];
  searchForm!: FormGroup;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeSearchForm();
  }

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

  initializeSearchForm() {
    this.searchForm = this.fb.group({
      ageRangeMin: [18, [Validators.min(18), Validators.max(100)]],
      ageRangeMax: [35, [Validators.min(18), Validators.max(100)]],
      fameRangeMin: [0, [Validators.min(0), Validators.max(10)]],
      fameRangeMax: [10, [Validators.min(0), Validators.max(10)]],
      location: [''],
      tags: [[]],
      sortBy: ['fameRating'],
      order: ['asc'],
    });
  }

  onSearchSubmit() {
    const params = this.buildSearchParams();
    this.fetchProfiles(params);
  }

  buildSearchParams(): HttpParams {
    const formValues = this.searchForm.value;
    let params = new HttpParams()
      .set('ageMin', formValues.ageRangeMin)
      .set('ageMax', formValues.ageRangeMax)
      .set('fameMin', formValues.fameRangeMin)
      .set('fameMax', formValues.fameRangeMax)
      .set('sortBy', formValues.sortBy)
      .set('order', formValues.order);

    if (formValues.location) {
      params = params.set('location', formValues.location);
    }

    if (formValues.tags && formValues.tags.length > 0) {
      params = params.set('tags', formValues.tags.join(','));
    }

    return params;
  }

  fetchProfiles(params?: HttpParams) {
    const url = 'http://localhost:8000/api/users/search';
    this.http.get<UserProfile[]>(url, { params }).subscribe({
      next: (profiles) => {
        console.log('Profiles received from API:', profiles);
        this.profiles = profiles.map((profile: any) => ({
          id: profile.id,
          username: profile.username || 'Anonymous',
          main_photo_url: profile.main_photo_url || 'https://example.com/default-photo.jpg',
          location: profile.location || { city_name: 'Unknown City', latitude: 0, longitude: 0 },
          age: profile.age || 'Unknown',
          gender: profile.gender || 'Unknown',
        }));
        console.log('Profiles after mapping:', this.profiles);
        this.currentProfileIndex = 0;
      },
      error: (error) => {
        console.error('Error fetching profiles:', error);
      },
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
    if (this.currentProfileIndex < this.profiles.length - 1) {
      this.currentProfileIndex++;
    } else {
      this.currentProfileIndex = 0;
    }
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