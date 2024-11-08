import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { Gender } from '../../models/Genders';
import { Tag } from '../../models/Tags';
import { UserResponseDto } from '../../DTOs/users/UserResponseDto';
import { Photo } from '../../models/Photo';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgForOf, AsyncPipe, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatStepperModule,
    MatCheckboxModule,
    NgIf,
    NgForOf,
    AsyncPipe,
    NgOptimizedImage,
  ],
  standalone: true,
})
export class EditProfileComponent implements OnInit {
  isLinear = true;
  profileInfoForm!: FormGroup;
  locationForm!: FormGroup;
  photoForm!: FormGroup;
  genders: Gender[] = [];
  tags: Tag[] = [];
  existingProfile: boolean = false;
  user: UserResponseDto | null = null;
  isCityValid: boolean = false;
  cityOptions!: Observable<string[]>;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.subscribeToFormChanges();
    this.loadInitialData();
    this.subscribeToUser();
    this.setupCityAutocomplete();
  }

  initializeForms() {
    this.profileInfoForm = this.fb.group({
      biography: ['', [Validators.required, Validators.maxLength(1024)]],
      gender: [null, [Validators.required]],
      sexualPreferences: [[], [Validators.required]],
      age: [null, [Validators.required, Validators.min(18), Validators.max(120)]],
      tags: [[]],
    });

    this.locationForm = this.fb.group({
      enableGeolocation: [false],
      city: ['', Validators.required],
      useIpLocation: [false],
      location: this.fb.group({
        latitude: [null],
        longitude: [null],
      }),
    });

    this.photoForm = this.fb.group({
      // Add form controls if needed
    });
  }

  subscribeToFormChanges() {
    this.locationForm.get('enableGeolocation')?.valueChanges.subscribe((enabled) => {
      this.onGeolocationToggle(enabled);
    });

    this.locationForm.get('useIpLocation')?.valueChanges.subscribe((enabled) => {
      this.onIpLocationToggle(enabled);
    });

    this.locationForm.get('city')?.valueChanges.pipe(debounceTime(500)).subscribe((cityName) => {
      this.searchCityCoordinates(cityName);
    });
  }

  loadInitialData() {
    this.loadGenders();
    this.loadTags();
    this.profileService.getMyProfile().subscribe(); // Initial fetch
  }

  subscribeToUser() {
    this.profileService.user$.subscribe({
      next: (userResponse) => {
        if (userResponse) {
          this.user = userResponse;
          if (this.user.profile_id) {
            this.existingProfile = true;
            this.populateForms(this.user);
          }
        }
      },
      error: (error) => {
        console.error('Error in user subscription:', error);
      },
    });
  }

  setupCityAutocomplete() {
    this.cityOptions = this.locationForm.get('city')!.valueChanges.pipe(
      debounceTime(300),
      switchMap((value) => this.searchCities(value))
    );
  }

  loadGenders() {
    this.profileService.getGenders().subscribe({
      next: (genders) => {
        this.genders = genders;
      },
      error: (err) => console.error('Error loading genders', err),
    });
  }

  loadTags() {
    this.profileService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
      },
      error: (err) => console.error('Error loading tags', err),
    });
  }

  populateForms(user: UserResponseDto) {
    this.profileInfoForm.patchValue({
      biography: user.biography || '',
      gender: user.gender || null,
      sexualPreferences: user.sexualPreferences?.map((g) => g.gender_id) || [],
      age: user.age || null,
      tags: user.tags?.map((t) => t.tag_id) || [],
    });

    this.locationForm.patchValue({
      city: user.location?.city_name || '',
      location: {
        latitude: user.location?.latitude || null,
        longitude: user.location?.longitude || null,
      },
    });
  }

  onGeolocationToggle(enabled: boolean) {
    if (enabled) {
      this.getCurrentLocation();
      this.locationForm.get('city')?.disable();
      this.locationForm.get('useIpLocation')?.disable();
    } else {
      this.locationForm.get('city')?.enable();
      this.locationForm.get('useIpLocation')?.enable();
    }
  }

  onIpLocationToggle(enabled: boolean) {
    if (enabled) {
      this.getLocationFromIP();
      this.locationForm.get('city')?.disable();
    } else {
      this.locationForm.get('city')?.enable();
    }
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.locationForm.patchValue({
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }

  getLocationFromIP() {
    this.http.get<any>('https://ipapi.co/json/').subscribe((data) => {
      this.locationForm.patchValue({
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });
    });
  }

  onSubmit() {
    if (this.profileInfoForm.valid && this.locationForm.valid) {
      this.isLoading = true;
      const profileData = {
        ...this.profileInfoForm.value,
        location: this.locationForm.value.location,
      };

      if (this.existingProfile) {
        this.profileService.updateProfile(profileData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/profile']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating profile:', error);
          },
        });
      } else {
        this.profileService.createProfile(profileData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/profile']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error creating profile:', error);
          },
        });
      }
    } else {
      console.warn('Form is invalid');
    }
  }

  onPhotoSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.isLoading = true;
      const uploadPromises = Array.from(files).map((file) =>
        this.profileService.uploadPhoto(file).toPromise()
      );

      Promise.all(uploadPromises)
        .then((newPhotos) => {
          this.isLoading = false;
          // Update user photos
          if (this.user && newPhotos) {
            this.user.photos = [...(this.user.photos || []), ...newPhotos.filter((photo): photo is Photo => photo !== undefined)];
          }
        })
        .catch((error) => {
          console.error('Error uploading photos:', error);
          this.isLoading = false;
        });
    }
  }

  setAsMainPhoto(photo: Photo) {
    if (!photo || !photo.photo_id) {
      console.error('Invalid photo or photo ID');
      return;
    }

    this.profileService.setMainPhoto(photo.photo_id).subscribe({
      next: () => {
        if (this.user) {
          this.user.main_photo_id = photo.photo_id;
        }
        console.log('Main photo set successfully');
      },
      error: (error) => {
        console.error('Error setting main photo:', error);
      },
    });
  }

  deletePhoto(photo: Photo) {
    if (!photo || !photo.photo_id) {
      console.error('Invalid photo or photo ID');
      return;
    }

    if (confirm('Are you sure you want to delete this photo?')) {
      this.profileService.deletePhoto(photo.photo_id).subscribe({
        next: () => {
          if (this.user && this.user.photos) {
            this.user.photos = this.user.photos.filter(
              (p) => p.photo_id !== photo.photo_id
            );
          }
          console.log('Photo deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting photo:', error);
        },
      });
    }
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    console.error('Image failed to load:', imgElement.src);
  }

  private searchCities(cityName: string): Observable<string[]> {
    if (!cityName) return of([]);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cityName
    )}&format=json&limit=5`;
    return this.http.get<any[]>(url).pipe(
      map((results) => results.map((result) => result.display_name))
    );
  }

  private searchCityCoordinates(cityName: string) {
    if (!cityName) return;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cityName
    )}&format=json&limit=1`;
    const headers = {
      'Accept-Language': 'fr',
      'User-Agent': 'matcha - matcha@example.com',
    };

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (results) => {
        if (results && results.length > 0) {
          const latitude = parseFloat(results[0].lat);
          const longitude = parseFloat(results[0].lon);
          this.locationForm.patchValue({
            location: {
              latitude: latitude,
              longitude: longitude,
            },
          });
          this.isCityValid = true;
        } else {
          console.warn('No city found for:', cityName);
          this.locationForm.patchValue({
            location: {
              latitude: null,
              longitude: null,
            },
          });
          this.isCityValid = false;
        }
      },
      error: (error) => {
        console.error('Error fetching city coordinates:', error);
        this.isCityValid = false;
      },
    });
  }
}
