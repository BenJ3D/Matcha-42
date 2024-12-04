import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { ProfileService } from "../../../services/profile.service";
import { ToastService } from "../../../services/toast.service";
import { MatSelectModule } from "@angular/material/select";
import { Gender } from "../../../models/Genders";
import { Tag } from "../../../models/Tags";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { HttpClient } from "@angular/common/http";
import { LocationDto, ProfileCreateDto } from "../../../DTOs/profiles/ProfileCreateDto";
import { distinctUntilChanged, Observable, of } from "rxjs";
import { debounceTime, map, switchMap } from "rxjs/operators";
import { Router } from "@angular/router";

@Component({
  selector: 'app-create-profile',
  standalone: true,
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
    MatCheckboxModule,
    NgIf,
    NgForOf,
    MatSlideToggleModule,
  ],
  templateUrl: './create-profile.component.html',
  styleUrl: './create-profile.component.scss'
})
export class CreateProfileComponent implements OnInit {
  profileForm!: FormGroup;
  genders: Gender[] = [];
  tags: Tag[] = [];
  locationIp: LocationDto | null = null;
  locationSelected: LocationDto = { latitude: 45.783329, longitude: 4.73333 };
  isCityValid: boolean = false;
  cityOptions!: Observable<string[]>;
  isLoading: boolean = false;
  validCities: string[] = []; // Step 1

  constructor(
    private fb: FormBuilder,
    protected profileService: ProfileService,
    protected toastService: ToastService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
    this.setupCityAutocomplete();
    this.getLocationFromIP().then(r => {});
  }

  loadInitialData() {
    this.loadGenders();
    this.loadTags();
    this.profileService.getMyProfile().subscribe();
  }

  initializeForm() {
    this.profileForm = this.fb.group({
      biography: ['', [Validators.required, Validators.maxLength(1024)]],
      gender: [null, [Validators.required]],
      sexualPreferences: [[]],
      age: [
        null,
        [Validators.required, Validators.min(18), Validators.max(120)],
      ],
      tags: [[]],
      city: ['', this.cityValidator.bind(this)], // Step 4
    });
  }

  // Step 3
  cityValidator(control: AbstractControl): ValidationErrors | null {
    const city = control.value.trim();
    if (city === '') {
      return null;
    }
    return this.validCities.includes(city) ? null : { invalidCity: true };
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
      map((cityNames) => {
        const uniqueCities = Array.from(new Set(cityNames));
        this.validCities = uniqueCities; // Step 2
        return uniqueCities;
      })
    );
  }

  private setupCityAutocomplete(): void {
    const cityControl = this.profileForm.get('city');

    if (cityControl) {
      this.cityOptions = cityControl.valueChanges.pipe(
        debounceTime(5),
        distinctUntilChanged(),
        switchMap((value) => this.searchCities(value))
      );
    }
  }

  onCitySelection(city: string) { // Step 5
    this.validCities = [city];
    this.profileForm.get('city')?.updateValueAndValidity();
  }

  onCityBlur() {
    const city: string = this.profileForm.getRawValue().city.trim();
    if (city) {
      this.searchCityCoordinates(city);
    } else {
      this.locationSelected.latitude = this.locationIp?.latitude || 0;
      this.locationSelected.longitude = this.locationIp?.longitude || 0;
      this.locationSelected.city = this.locationIp?.city;
    }
  }

  searchCityCoordinates(cityName: string) {
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
          this.profileForm.patchValue({ city: results[0].name }, { emitEvent: false });
          this.locationSelected.latitude = parseFloat(results[0].lat);
          this.locationSelected.longitude = parseFloat(results[0].lon);
          this.locationSelected.city = results[0].name.split(',')[0].trim();
        } else {
          this.profileForm.get('city')?.setErrors({ cityNotFound: true });
          this.toastService.show('City not found');
        }
      },
      error: (error) => {
        console.error('Error fetching city coordinates:', error);
      },
    });
  }

  onSubmit() {
    this.onCityBlur();
    if (this.profileForm.valid) {
      const updateUserData: ProfileCreateDto = {
        biography: this.profileForm.value.biography,
        gender: this.profileForm.value.gender,
        sexualPreferences: this.profileForm.value.sexualPreferences,
        age: this.profileForm.value.age,
        tags: this.profileForm.value.tags,
        location: this.locationSelected ?? this.locationIp,
      }
      this.isLoading = true;
      this.profileService.createProfile(updateUserData).subscribe({
        next: () => {
          this.toastService.show('User profile created successfully.');
          this.goToProfile();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating user profile', error);
          this.toastService.show('Error creating user profile');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
    }
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

  getLocationFromIP(): Promise<void> {
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
          console.error('Error getting IP location from first service:', error);
          this.isCityValid = false;
          this.getLocationFromIP2().then(() => resolve());
        },
      });
    });
  }

  getLocationFromIP2(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any>('https://api.ipbase.com/v1/json/').subscribe({
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

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}
