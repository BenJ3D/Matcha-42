import {Component, OnInit} from '@angular/core';
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {ProfileService} from "../../../services/profile.service";
import {ToastService} from "../../../services/toast.service";
import {MatSelectModule} from "@angular/material/select";
import {Gender} from "../../../models/Genders";
import {Tag} from "../../../models/Tags";
import {MatCardModule} from "@angular/material/card";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {HttpClient} from "@angular/common/http";
import {LocationDto, ProfileCreateDto} from "../../../DTOs/profiles/ProfileCreateDto";
import {distinctUntilChanged, Observable, of} from "rxjs";
import {debounceTime, map, switchMap} from "rxjs/operators";
import {Router} from "@angular/router";

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
  locationSelected: LocationDto = {latitude: 0, longitude: 0};
  isCityValid: boolean = false;
  cityOptions!: Observable<string[]>;
  isLoading: boolean = false;


  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastService: ToastService,
    private http: HttpClient,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
    this.setupCityAutocomplete();
    this.getLocationFromIP2().then(r => {
    });
  }

  loadInitialData() {
    this.loadGenders();
    this.loadTags();
    this.profileService.getMyProfile().subscribe(); // Initial fetch
  }


  initializeForm() {
    this.profileForm = this.fb.group({
      biography: ['', [Validators.required, Validators.maxLength(1024)]],
      gender: [null, [Validators.required]],
      sexualPreferences: [[], [Validators.required]],
      age: [
        null,
        [Validators.required, Validators.min(18), Validators.max(120)],
      ],
      tags: [[]],
      city: [''],
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const updateUserData: ProfileCreateDto = {
        biography: this.profileForm.value.biography,
        gender: this.profileForm.value.gender,
        sexualPreferences: this.profileForm.value.sexualPreferences,
        age: this.profileForm.value.age,
        tags: this.profileForm.value.tags,
        location: this.locationSelected || this.locationIp,
      }
      this.isLoading = true;
      this.profileService.createProfile(updateUserData).subscribe({
        next: () => {
          this.toastService.show('User profile created successfully.');
          this.goToProfile();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error creating user profile', err);
          this.toastService.show('Error creating user profile');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.profileForm.touched;
    }
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
        this.tags = tags.sort((a, b) => a.tag_name.localeCompare(b.tag_name));

      },
      error: (err) => console.error('Error loading tags', err),
    });
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
            console.log('Location from IP:', data.city + ', ' + data.longitude + '/' + data.latitude);
            ;

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

  private setupCityAutocomplete(): void {
    const cityControl = this.profileForm.get('city');

    if (cityControl) {
      this.cityOptions = cityControl.valueChanges.pipe(
        // Ajoutez un délai pour réduire le nombre de requêtes
        debounceTime(300),
        // Ignorez les valeurs identiques consécutives
        distinctUntilChanged(),
        // Exécutez la recherche
        switchMap((value) => this.searchCities(value))
      );
    }
  }

  onCityBlur() {
    const city: string = this.profileForm.getRawValue().city.trim();
    if (city) {
      console.log('City:', city);
      this.searchCityCoordinates(city);
    } else {
      this.locationSelected.latitude = this.locationIp?.latitude || 0;
      this.locationSelected.longitude = this.locationIp?.longitude || 0;
      console.log('City is empty');
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

    this.http.get<any[]>(url, {headers}).subscribe({
      next: (results) => {
        if (results && results.length > 0) {
          this.locationSelected.latitude = parseFloat(results[0].lat);
          this.locationSelected.longitude = parseFloat(results[0].lon);
        } else {
          this.locationSelected.latitude = this.locationIp?.latitude || 0;
          this.locationSelected.longitude = this.locationIp?.longitude || 0;
        }
      },
      error: (error) => {
        console.error('Error fetching city coordinates:', error);
      },
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

}
