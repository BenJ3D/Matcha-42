import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { Gender } from '../../models/Genders';
import { Tag } from '../../models/Tags';
import { UserResponseDto } from '../../DTOs/users/UserResponseDto';
import { Photo } from '../../models/Photo';
import { HttpClient } from '@angular/common/http';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AsyncPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LocationDto } from "../../DTOs/profiles/ProfileCreateDto";

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
    MatSlideToggleModule,
  ],
  standalone: true,
})
export class EditProfileComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
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
  private isInitialProfileCreated = false;
  locationIp: LocationDto | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.initializeForms();
    this.subscribeToFormChanges();
    this.loadInitialData();
    this.subscribeToUser();
    this.setupCityAutocomplete();
    this.getLocationFromIP2().then(r => {
    });
  }


  initializeForms() {
    this.profileInfoForm = this.fb.group({
      biography: ['', [Validators.required, Validators.maxLength(1024)]],
      gender: [null, [Validators.required]],
      sexualPreferences: [[], [Validators.required]],
      age: [
        null,
        [Validators.required, Validators.min(18), Validators.max(120)],
      ],
      tags: [[]],
    });

    this.locationForm = this.fb.group({
      city: [''],
      location: this.fb.group({
        latitude: [null],
        longitude: [null],
      }),
    });

    this.photoForm = this.fb.group({});
  }

  subscribeToFormChanges() {
    this.locationForm
      .get('city')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe((cityName) => {
        if (cityName) {
          this.searchCityCoordinates(cityName);
        }
      });
  }

  loadInitialData() {
    this.loadGenders();
    this.loadTags();
    this.profileService.getMyProfile().subscribe();
  }

  subscribeToUser() {
    this.profileService.user$.subscribe({
      next: (userResponse) => {
        if (userResponse) {
          this.user = userResponse;
          if (this.user.profile_id) {
            this.existingProfile = true;

            if (!this.user.location ||
              this.user.location.latitude === null ||
              this.user.location.longitude === null ||
              this.user.location.city_name === 'Unknown') {
              this.populateFormsWithoutLocation(this.user);
            } else {
              this.populateForms(this.user);
            }
          }
        }
      },
      error: (error) => {
        console.error('Error in user subscription:', error);
      },
    });
  }

  onStepChange(event: any): void {
    if (event.selectedIndex === 2) {
      const locationValue = this.locationForm.get('location')?.value;

      if (!locationValue ||
        locationValue.latitude === null ||
        locationValue.longitude === null) {
        this.isLoading = true;

        this.forceLocationFromIP();
        this.isLoading = false;
      }
    }
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
      error: (error) => console.error('Error loading genders', error),
    });
  }

  loadTags() {
    this.profileService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags.sort((a, b) => a.tag_name.localeCompare(b.tag_name));

      },
      error: (error) => console.error('Error loading tags', error),
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

  getLocationFromIP(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any>('https://ipapi.co/json/').subscribe({
        next: (data) => {
          if (data.city && data.latitude && data.longitude) {
            this.locationForm.patchValue({
              city: data.city,
              location: {
                latitude: data.latitude,
                longitude: data.longitude,
              },
            });
            this.isCityValid = true;
          }
          resolve();
        },
        error: (error) => {
          console.error('Error getting IP location:', error);
          this.isCityValid = false;
          resolve();
        },
      });
    });
  }

  forceLocationFromIP() {
    if (this.locationIp) {
      this.locationForm.patchValue({
        location: {
          latitude: this.locationIp.latitude,
          longitude: this.locationIp.longitude,
        },
      });
      this.isCityValid = true;
    }
  }

  getLocationFromIP2(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any>('https://ipapi.co/json/').subscribe({
        next: (data) => {
          if (data.city && data.latitude && data.longitude) {
            this.locationIp = {
              latitude: data.latitude,
              longitude: data.longitude,
            }
          }
          resolve();
        },
        error: (error) => {
          console.error('Error getting IP location:', error);
          this.isCityValid = false;
          resolve();
        },
      });
    });
  }

  onPartialSubmit() {
    if (
      this.profileInfoForm.valid &&
      !this.existingProfile &&
      !this.isInitialProfileCreated
    ) {
      this.isLoading = true;
      const partialProfileData = {
        ...this.profileInfoForm.value,
      };

      this.profileService.createProfile(partialProfileData).subscribe({
        next: (response) => {
          this.isInitialProfileCreated = true;
          this.existingProfile = true;
          this.profileService.getMyProfile().subscribe((user) => {
            if (user) {
              this.user = user;
            }
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating initial profile:', error);
          this.isLoading = false;
        },
      });
    }
  }

  onSubmit() {
    if (this.profileInfoForm.valid && this.locationForm.valid) {
      this.isLoading = true;
      const profileData = {
        ...this.profileInfoForm.value,
        location: this.locationForm.value.location ?? this.locationIp,
      };

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
            this.user.photos = [
              ...(this.user.photos || []),
              ...newPhotos.filter(
                (photo): photo is Photo => photo !== undefined
              ),
            ];
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

        },
        error: (error) => {
          console.error('Error deleting photo:', error);
        },
      });
    }
  }

  onCityBlur() {
    const cityControl = this.locationForm.get('city');
    if (cityControl && cityControl.value) {
      this.searchCityCoordinates(cityControl.value);
    }
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    console.error('Image failed to load:', imgElement.src);
  }

  private populateFormsWithoutLocation(user: UserResponseDto) {
    this.profileInfoForm.patchValue({
      biography: user.biography || '',
      gender: user.gender || null,
      sexualPreferences: user.sexualPreferences?.map((g) => g.gender_id) || [],
      age: user.age || null,
      tags: user.tags?.map((t) => t.tag_id) || [],
    });

    this.locationForm.patchValue(
      {
        city: '',
        location: {
          latitude: null,
          longitude: null,
        },
      },
      { emitEvent: false }
    );
  }

  private searchCities(cityName: string): Observable<string[]> {
    if (!cityName) return of([]);

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=10&class=place&type=city`;

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


  private searchCityCoordinates(cityName: string) {
    if (!cityName) {
      this.isCityValid = true;
      this.locationForm.patchValue({
        location: {
          latitude: null,
          longitude: null,
        },
      });
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cityName
    )}&format=json&limit=5`;
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
