import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider'

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
  fame_rating: number | null;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
  ],
})
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly minAge = 18;
  readonly maxAge = 120;
  readonly minFame = 0;
  readonly maxFame = 100;


  currentProfileIndex: number = 0;
  animateRight: boolean = false;
  animateLeft: boolean = false;
  profiles: UserProfile[] = [];
  searchForm!: FormGroup;
  genders: any[] = [];
  tags: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {}

  get currentProfile(): UserProfile | undefined {
    return this.profiles[this.currentProfileIndex];
  }

  ngOnInit() {
    this.initializeSearchForm();
    this.loadGenders();
    this.loadTags();
    this.fetchProfiles();
  }

  initializeSearchForm() {
    this.searchForm = this.fb.group({
      ageRange: this.fb.group({
        min: [this.minAge],
        max: [this.maxAge]
      }),
      fameRange: this.fb.group({
        min: [this.minFame],
        max: [this.maxFame]
      }),
      location: [''],
      tags: [[]],
      preferredGenders: [[]],
      sortBy: [''],
      order: [''],
    });
  }

  loadGenders() {
    this.http.get<any[]>('http://localhost:8000/api/genders/').subscribe((data) => {
      this.genders = data;
    });
  }

  loadTags() {
    this.http.get<any[]>('http://localhost:8000/api/tags').subscribe((data) => {
      this.tags = data;
    });
  }

  openSearchPanel() {
    this.sidenav.open();
  }

  closeSearchPanel() {
    this.sidenav.close();
  }

  onSearchSubmit() {
    this.closeSearchPanel();
    this.fetchProfiles();
  }

  fetchProfiles() {
    let params = new HttpParams();
    const formValue = this.searchForm.value;

    if (formValue.ageMin) {
      params = params.set('ageMin', formValue.ageMin);
    }
    if (formValue.ageMax) {
      params = params.set('ageMax', formValue.ageMax);
    }
    if (formValue.fameMin) {
      params = params.set('fameMin', formValue.fameMin);
    }
    if (formValue.fameMax) {
      params = params.set('fameMax', formValue.fameMax);
    }
    if (formValue.location) {
      params = params.set('location', formValue.location);
    }
    if (formValue.tags && formValue.tags.length > 0) {
      params = params.set('tags', formValue.tags.join(','));
    }
    if (formValue.preferredGenders && formValue.preferredGenders.length > 0) {
      params = params.set('preferredGenders', formValue.preferredGenders.join(','));
    }
    if (formValue.sortBy) {
      params = params.set('sortBy', formValue.sortBy);
    }
    if (formValue.order) {
      params = params.set('order', formValue.order);
    }

    this.http
      .get<UserProfile[]>('http://localhost:8000/api/users/search', { params })
      .subscribe({
        next: (profiles) => {
          if (profiles.length === 0) {
            this.profiles = [];
          } else {
            this.profiles = profiles;
            this.currentProfileIndex = 0;
          }
        },
        error: (error) => {
          console.error('Error fetching profiles:', error);
        },
      });
  }

  onSwipe(liked: boolean) {
    if (liked) {
      console.log('Liked profile:', this.currentProfile?.username);
      this.animateRight = true;
    } else {
      console.log('Passed profile:', this.currentProfile?.username);
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
      this.profiles = []; // No more profiles
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