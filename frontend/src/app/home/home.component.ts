import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSidenavModule, MatSidenav} from '@angular/material/sidenav';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {ProfileService} from '../../services/profile.service';
import {Tag} from '../../models/Tags';
import {HttpParams} from '@angular/common/http';
import {debounceTime, map, switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {UserResponseDto} from '../../DTOs/users/UserResponseDto';
import {SearchStateService} from './search-state.service';

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
    MatAutocompleteModule,
  ],
})
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly minAge = 18;
  readonly maxAge = 120;
  readonly minFame = 0;
  readonly maxFame = 10;

  private isActionInProgress: boolean = false;
  private isAnimating: boolean = false;

  currentProfileIndex: number = 0;
  animateRight: boolean = false;
  animateLeft: boolean = false;
  profiles: UserResponseDto[] = [];
  searchForm!: FormGroup;
  tags: Tag[] = [];
  isLoading: boolean = false;
  cityOptions!: Observable<string[]>;
  userLocation!: { latitude: number; longitude: number };

  hasMainPhoto: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private http: HttpClient,
    private searchStateService: SearchStateService
  ) {
  }

  get currentProfile(): UserResponseDto {
    return this.profiles[this.currentProfileIndex];
  }

  ngOnInit() {
    this.initializeSearchForm();
    const savedState = this.searchStateService.getState();
    if (savedState) {
      this.searchForm.patchValue(savedState);
    }
    this.loadTags();
    this.setupCityAutocomplete();
    this.fetchUserLocation().subscribe({
      next: () => {
        this.fetchProfiles();
      }
    });

    this.searchForm.valueChanges.subscribe((value) => {
      this.searchStateService.setState(value);
    });
  }

  fetchUserLocation(): Observable<void> {
    return this.profileService.getMyProfile().pipe(
      map((data) => {
        this.hasMainPhoto = !!data.main_photo_url;

        if (
          data.location &&
          data.location.latitude !== null &&
          data.location.longitude !== null
        ) {
          this.userLocation = {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          };
        }
      })
    );
  }

  initializeSearchForm() {
    this.searchForm = this.fb.group({
      ageRange: this.fb.group({
        min: [this.minAge, Validators.required],
        max: [this.maxAge, Validators.required],
      }),
      fameRange: this.fb.group({
        min: [this.minFame, Validators.required],
        max: [this.maxFame, Validators.required],
      }),
      location: [''],
      tags: [[]],
      sortBy: [''],
      order: [''],
    });
  }

  loadTags() {
    this.profileService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags.sort((a, b) => a.tag_name.localeCompare(b.tag_name));
      },
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
    this.isLoading = true;
    let params = new HttpParams();
    const formValue = this.searchForm.getRawValue();

    if (formValue.ageRange.min != null) {
      params = params.set('ageMin', formValue.ageRange.min.toString());
    }
    if (formValue.ageRange.max != null) {
      params = params.set('ageMax', formValue.ageRange.max.toString());
    }
    if (formValue.fameRange.min != null) {
      params = params.set('fameMin', formValue.fameRange.min.toString());
    }
    if (formValue.fameRange.max != null) {
      params = params.set('fameMax', formValue.fameRange.max.toString());
    }
    if (formValue.location) {
      params = params.set('location', formValue.location);
    }
    if (formValue.tags && formValue.tags.length > 0) {
      params = params.set('tags', formValue.tags.join(','));
    }
    if (formValue.sortBy && formValue.sortBy !== 'location') {
      params = params.set('sortBy', formValue.sortBy);
    }
    if (formValue.order) {
      params = params.set('order', formValue.order);
    }

    this.profileService.searchProfiles(params).subscribe({
      next: (profiles) => {
        this.isLoading = false;
        if (profiles.length === 0) {
          this.profiles = [];
        } else {
          profiles = profiles.filter(profile =>
            !profile.isLiked &&
            !profile.isUnliked &&
            !profile.isBlocked &&
            !profile.isFakeReported &&
            !profile.BlockedMe
          );

          profiles.forEach(profile => {
            profile.distance = this.calculateDistance(profile.location);
          });
          this.profiles = this.sortProfiles(
            profiles,
            formValue.sortBy,
            formValue.order
          );
          this.currentProfileIndex = 0;
        }
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  private sortProfiles(
    profiles: UserResponseDto[],
    sortBy: string,
    order: string
  ): UserResponseDto[] {
    return profiles.sort((a, b) => {

      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'age':
          aValue = a.age;
          bValue = b.age;
          break;
        case 'fame_rating':
          aValue = a.fame_rating;
          bValue = b.fame_rating;
          break;
        case 'location':
          aValue = this.calculateDistance(a.location);
          bValue = this.calculateDistance(b.location);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      } else if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  private calculateDistance(location?: {
    latitude: number;
    longitude: number;
    city_name?: string;
  }): number {
    if (!location || !this.userLocation) {
      return Number.MAX_SAFE_INTEGER;
    }

    const userLatitude = this.userLocation.latitude;
    const userLongitude = this.userLocation.longitude;
    const profileLatitude = location.latitude;
    const profileLongitude = location.longitude;

    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(profileLatitude - userLatitude);
    const dLon = toRadians(profileLongitude - userLongitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(userLatitude)) *
      Math.cos(toRadians(profileLatitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  onSwipe(liked: boolean) {
    const currentProfileId = this.currentProfile?.id;
    if (!currentProfileId || this.isActionInProgress || this.isAnimating) return;

    this.isActionInProgress = true;
    this.isAnimating = true;

    if (liked) {
      this.animateRight = true;
      this.profileService.addLikeUser(currentProfileId).subscribe({
        next: () => {
          setTimeout(() => {
            this.nextProfile();
            this.resetAnimations();
            this.isActionInProgress = false;
            this.isAnimating = false;
          }, 500);
        },
        error: () => {
          this.resetAnimations();
          this.isActionInProgress = false;
          this.isAnimating = false;
        }
      });
    } else {
      this.animateLeft = true;
      this.profileService.addUnlikeUser(currentProfileId).subscribe({
        next: () => {
          setTimeout(() => {
            this.nextProfile();
            this.resetAnimations();
            this.isActionInProgress = false;
            this.isAnimating = false;
          }, 500);
        },
        error: () => {
          this.resetAnimations();
          this.isActionInProgress = false;
          this.isAnimating = false;
        }
      });
    }
  }

  nextProfile() {
    if (this.currentProfileIndex < this.profiles.length - 1) {
      this.currentProfileIndex++;
    } else {
      this.profiles = [];
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

  goToProfile(userId: number) {
    this.router.navigate(['/profile'], {queryParams: {id: userId}});
  }

  setupCityAutocomplete() {
    this.cityOptions = this.searchForm.get('location')!.valueChanges.pipe(
      debounceTime(300),
      switchMap((value) => this.searchCities(value))
    );
  }

  private searchCities(cityName: string): Observable<string[]> {
    if (!cityName) return of([]);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cityName
    )}&format=json&limit=5&class=place&type=city`;

    return this.http.get<any[]>(url).pipe(
      map((results) =>
        results.map((result) => {
          const cityName = result.display_name.split(',')[0].trim();
          return cityName;
        })
      ),
      map((cityNames) => Array.from(new Set(cityNames)))
    );
  }

  resetSearch() {
    this.searchForm.reset({
      ageRange: {min: this.minAge, max: this.maxAge},
      fameRange: {min: this.minFame, max: this.maxFame},
      location: '',
      tags: [],
      sortBy: '',
      order: '',
    });
    this.searchStateService.clearState();
    this.fetchProfiles();
  }
}
