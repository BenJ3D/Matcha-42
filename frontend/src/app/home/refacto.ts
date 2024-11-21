import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { debounceTime, switchMap, map } from 'rxjs/operators';
import { ProfileService } from '../../services/profile.service';
import { UserResponseDto } from '../../DTOs/users/UserResponseDto';
import { Tag } from '../../models/Tags';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [],
})
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private http: HttpClient
  ) {}

  readonly minAge = 18;
  readonly maxAge = 120;
  readonly minFame = 0;
  readonly maxFame = 10;

  userLocation!: { latitude: number; longitude: number };
  cityOptions!: Observable<string[]>;
  profiles: UserResponseDto[] = [];
  currentProfileIndex: number = 0;
  searchForm!: FormGroup;
  tags: Tag[] = [];

  isLoading: boolean = false;
  animateRight: boolean = false;
  animateLeft: boolean = false;

  get currentProfile(): UserResponseDto | undefined {
    return this.profiles[this.currentProfileIndex];
  }

  ngOnInit(): void {
    this.initializeSearchForm();
    this.loadTags();
    this.setupCityAutocomplete();
    this.fetchUserLocation().subscribe({
      next: () => {
        this.fetchProfiles();
      },
    });
  }

  initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      minAge: [this.minAge],
      maxAge: [this.maxAge],
      minFame: [this.minFame],
      maxFame: [this.maxFame],
      tags: [[]],
      city: [''],
    });
  }

  loadTags(): void {
    this.profileService.getTags().subscribe({
      next: (tags: Tag[]) => {
        this.tags = tags;
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  setupCityAutocomplete(): void {
    this.cityOptions = this.searchForm.get('city')!.valueChanges.pipe(
      debounceTime(300),
      switchMap((city: string) => {
        return this.searchCities(city);
      })
    );
  }

  searchCities(city: string): Observable<string[]> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      city
    )}&format=json&limit=5&class=place&type=city`;

    return this.http.get<any[]>(url).pipe(
      map((cities: any) => {
        return cities.map((city: any) => city.display_name);
      })
    );
  }

  fetchProfiles(): void {
    this.isLoading = true;
    let params = new HttpParams();
    const formValue = this.searchForm.value.getRawValue();

    if (formValue.minAge !== null && formValue.minAge > this.minAge) {
      params = params.set('minAge', formValue.minAge.toString());
    }
    if (formValue.maxAge !== null && formValue.maxAge < this.maxAge) {
      params = params.set('maxAge', formValue.maxAge.toString());
    }
    if (formValue.minFame !== null && formValue.minFame > this.minFame) {
      params = params.set('minFame', formValue.minFame.toString());
    }
    if (formValue.maxFame !== null && formValue.maxFame < this.maxFame) {
      params = params.set('maxFame', formValue.maxFame.toString());
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
      next: (profiles: UserResponseDto[]) => {
        if (profiles.length === 0) {
          this.profiles = [];
        } else {
          this.profiles = profiles.filter((profile) => {
            !profile.isLiked &&
              !profile.isUnliked &&
              !profile.isBlocked &&
              !profile.BlockedMe;
          });

          profiles.forEach((profile) => {
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
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  fetchUserLocation(): Observable<void> {
    return this.profileService.getMyProfile().pipe(
      map((profile: UserResponseDto) => {
        if (
          profile.location &&
          profile.location.latitude !== null &&
          profile.location.longitude !== null
        ) {
          this.userLocation = {
            latitude: profile.location.latitude,
            longitude: profile.location.longitude,
          };
        }
      })
    );
  }

  calculateDistance(): number {
    return 0; // Mock implementation
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
          aValue = a[sortBy];
          bValue = b[sortBy];
          break;
      }

      if (order === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }
}
