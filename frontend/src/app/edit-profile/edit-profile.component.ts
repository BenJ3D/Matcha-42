// src/app/components/edit-profile/edit-profile.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Router, RouterModule } from '@angular/router';
import { Gender } from '../../models/Genders';
import { Tag } from '../../models/Tags';
import { UserResponseDto } from '../../DTOs/users/UserResponseDto';
import { Photo } from '../../models/Photo';

import {CommonModule, NgOptimizedImage} from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ProfileUpdateDto } from '../../DTOs/profiles/ProfileUpdateDto';
import { ProfileCreateDto } from '../../DTOs/profiles/ProfileCreateDto';
import { HttpClient } from '@angular/common/http';
import { debounceTime } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    NgOptimizedImage,
  ],
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;
  genders: Gender[] = [];
  tags: Tag[] = [];
  existingProfile: boolean = false;
  user: UserResponseDto | null = null;
  isCityValid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.subscribeToFormChanges();
    this.loadInitialData();
    this.subscribeToUser();
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      biography: ['', [Validators.required, Validators.maxLength(1024)]],
      gender: [null, [Validators.required]],
      sexualPreferences: [[], [Validators.required]],
      age: [
        null,
        [Validators.required, Validators.min(18), Validators.max(120)],
      ],
      tags: [[]],
      city: ['', Validators.required],
      location: this.fb.group({
        latitude: [null],
        longitude: [null],
      }),
    });
  }

  private subscribeToFormChanges() {
    this.profileForm
      .get('city')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe((cityName) => {
        this.searchCityCoordinates(cityName);
      });
  }

  private loadInitialData() {
    this.loadGenders();
    this.loadTags();
    this.profileService.getMyProfile().subscribe(); // Initial fetch
  }

  private subscribeToUser() {
    this.profileService.user$.subscribe({
      next: (userResponse) => {
        if (userResponse) {
          this.user = userResponse;
          console.log('DBG updated user:', this.user);
          if (this.user.profile_id) {
            this.existingProfile = true;
            this.populateForm(this.user);
          }
        }
      },
      error: (error) => {
        console.error('Error in user subscription:', error);
      },
    });
  }

  private loadGenders() {
    this.profileService.getGenders().subscribe({
      next: (genders) => {
        this.genders = genders;
        console.log('DBG loaded genders:', genders);
      },
      error: (err) => console.error('Error loading genders', err),
    });
  }

  private loadTags() {
    this.profileService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
        console.log('DBG loaded tags:', tags);
      },
      error: (err) => console.error('Error loading tags', err),
    });
  }

  private populateForm(user: UserResponseDto) {
    this.profileForm.patchValue({
      biography: user.biography || '',
      gender: user.gender || null,
      sexualPreferences: user.sexualPreferences?.map((g) => g.gender_id) || [],
      age: user.age || null,
      tags: user.tags?.map((t) => t.tag_id) || [],
      city: user.location?.city_name || '',
    });
    console.log('DBG populated form with user data');
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const formValues = this.profileForm.value;

      const profileData: ProfileCreateDto | ProfileUpdateDto = {
        biography: formValues.biography,
        gender: formValues.gender,
        sexualPreferences: formValues.sexualPreferences,
        age: formValues.age,
        tags: formValues.tags,
        location: {
          latitude: formValues.location.latitude,
          longitude: formValues.location.longitude,
        },
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
          console.log('DBG newPhotos after upload:', newPhotos);
          // Les données utilisateur sont déjà rechargées via le service
          this.isLoading = false;
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
        console.log('DBG main photo set successfully');
        // Les données utilisateur sont déjà rechargées via le service
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
          console.log('DBG photo deleted successfully');
          // Les données utilisateur sont déjà rechargées via le service
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
    // imgElement.src = 'assets/default-image.png'; // Optionnel : définir une image par défaut TODO TODO
  }

  private searchCityCoordinates(cityName: string) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      cityName
    )}&format=json&limit=1`;
    const headers = {
      'Accept-Language': 'fr',
      'User-Agent': 'matcha - matcha@example.com',
    };

    this.http.get<any[]>(url, { headers }).subscribe({
      next: (results) => {
        console.log('DBG searchCityCoordinates results:', results);
        if (results && results.length > 0) {
          const latitude = parseFloat(results[0].lat);
          const longitude = parseFloat(results[0].lon);
          this.profileForm.patchValue({
            location: {
              latitude: latitude,
              longitude: longitude,
            },
          });
          this.isCityValid = true;
        } else {
          console.warn('Aucune ville trouvée pour :', cityName);
          this.profileForm.patchValue({
            location: {
              latitude: null,
              longitude: null,
            },
          });
          this.isCityValid = false;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des coordonnées :', error);
        this.isCityValid = false;
      },
    });
  }
}
