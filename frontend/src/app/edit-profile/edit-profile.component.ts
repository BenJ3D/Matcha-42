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

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      biography: ['', [Validators.required, Validators.maxLength(1024)]],
      gender: [null, [Validators.required]],
      sexualPreferences: [[], [Validators.required]],
      age: [null, [Validators.required, Validators.min(18), Validators.max(120)]],
      tags: [[]],
      city: ['', Validators.required],
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
        // location: {
        //   latitude: null,
        //   longitude: null,
        //   city_name: formValues.city,
        // },
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
      for (let i = 0; i < files.length; i++) {
        this.uploadPhoto(files[i]);
      }
    }
  }

  uploadPhoto(file: File) {
    this.profileService.uploadPhoto(file).subscribe({
      next: (photo) => {
        this.photos.push(photo);
      },
      error: (error) => {
        console.error('Error uploading photo:', error);
      },
    });
  }

  setAsMainPhoto(photo: Photo) {
    this.profileService.setMainPhoto(photo.photo_id).subscribe({
      next: () => {
        console.log('Main photo set successfully');
        if (this.user) {
          this.user.main_photo_url = photo.url;
        }
      },
      error: (error) => {
        console.error('Error setting main photo:', error);
      },
    });
  }

  deletePhoto(photo: Photo) {
    if (confirm('Are you sure you want to delete this photo?')) {
      this.profileService.deletePhoto(photo.photo_id).subscribe({
        next: () => {
          this.photos = this.photos.filter((p) => p.photo_id !== photo.photo_id);
          console.log('Photo deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting photo:', error);
        },
      });
    }
  }
}
