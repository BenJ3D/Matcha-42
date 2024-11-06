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

import { CommonModule } from '@angular/common';
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
import { debounce, debounceTime } from 'rxjs';

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
  ],
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;
  genders: Gender[] = [];
  tags: Tag[] = [];
  existingProfile: boolean = false;
  photos: Photo[] = [];
  user: UserResponseDto | null = null;
  isCityValid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
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

    this.profileForm
      .get('city')
      ?.valueChanges.pipe(debounceTime(500))
      .subscribe((cityName) => {
        this.searchCityCoordinates(cityName);
      });

    this.loadGenders();
    this.loadTags();

    this.profileService.getMyProfile().subscribe({
      next: (user) => {
        this.user = user;
        if (user.profile_id) {
          this.existingProfile = true;
          this.populateForm(user);
          if (user.photos) {
            this.photos = user.photos;
          }
        }
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
      },
    });
  }

  loadGenders() {
    this.profileService.getGenders().subscribe({
      next: (genders) => (this.genders = genders),
      error: (err) => console.error('Error loading genders', err),
    });
  }

  searchCityCoordinates(cityName: string) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
    const headers = {
      'Accept-Language': 'fr',
      'User-Agent': 'matcha - matcha@example.com',
    };
  
    this.http.get<any[]>(url, { headers }).subscribe({
      next: (results) => {
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

  loadTags() {
    this.profileService.getTags().subscribe({
      next: (tags) => (this.tags = tags),
      error: (err) => console.error('Error loading tags', err),
    });
  }

  populateForm(user: UserResponseDto) {
    this.profileForm.patchValue({
      biography: user.biography || '',
      gender: user.gender || null,
      sexualPreferences: user.sexualPreferences?.map((g) => g.gender_id) || [],
      age: user.age || null,
      tags: user.tags?.map((t) => t.tag_id) || [],
      city: user.location?.city_name || '',
    });
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
          longitude: formValues.location.longitude
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

  async onPhotoSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const uploadPromises = Array.from(files).map(file => this.uploadPhoto(file));
      
      try {
        // Wait for all uploads to complete
        const newPhotos = await Promise.all(uploadPromises);
        // Update the photos array with the new photos
        this.photos = [...this.photos, ...newPhotos];
      } catch (error) {
        console.error('Error uploading photos:', error);
      }
    }
  }

  uploadPhoto(file: File): Promise<Photo> {
    return new Promise((resolve, reject) => {
      this.profileService.uploadPhoto(file).subscribe({
        next: (photo) => resolve(photo),
        error: (error) => reject(error)
      });
    });
  }

  setAsMainPhoto(event: Event, photo: Photo) {
    event.preventDefault(); // Prevent form submission
    event.stopPropagation(); // Stop event bubbling
    
    // Check if photo exists and has a valid ID
    if (!photo || !photo.photo_id) {
      console.error('Invalid photo or photo ID');
      return;
    }

    // Check if the photo is actually in our photos array
    const photoExists = this.photos.some(p => p.photo_id === photo.photo_id);
    if (!photoExists) {
      console.error('Photo does not exist in the current photos array');
      return;
    }

    this.profileService.setMainPhoto(photo.photo_id).subscribe({
      next: () => {
        if (this.user) {
          this.user.main_photo_url = photo.url;
          this.user.main_photo_id = photo.photo_id;
        }
        // Update the UI to reflect the change
        this.photos = this.photos.map(p => ({
          ...p,
          is_main: p.photo_id === photo.photo_id
        }));
      },
      error: (error) => {
        console.error('Error setting main photo:', error);
      },
    });
  }

  deletePhoto(event: Event, photo: Photo) {
    event.preventDefault(); // Prevent form submission
    event.stopPropagation(); // Stop event bubbling
    
    // Check if photo exists and has a valid ID
    if (!photo || !photo.photo_id) {
      console.error('Invalid photo or photo ID');
      return;
    }

    if (confirm('Are you sure you want to delete this photo?')) {
      this.profileService.deletePhoto(photo.photo_id).subscribe({
        next: () => {
          this.photos = this.photos.filter(p => p.photo_id !== photo.photo_id);
          // If we deleted the main photo, clear the main photo reference
          if (this.user && this.user.main_photo_id === photo.photo_id) {
            this.user.main_photo_url = '';
            this.user.main_photo_id = 0;
          }
        },
        error: (error) => {
          console.error('Error deleting photo:', error);
        },
      });
    }
  }
}