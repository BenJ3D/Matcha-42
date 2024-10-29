import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { ProfileCreateDto } from '../../DTOs/profiles/ProfileCreateDto';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatOption,
    MatProgressSpinner
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      biography: ['', [Validators.required, Validators.maxLength(1024)]],
      gender: [null, [Validators.required]],
      age: [null, [Validators.required, Validators.min(18), Validators.max(120)]],
      main_photo_id: [null],
      location: this.fb.group({
        latitude: [null],
        longitude: [null]
      }),
      tags: [[]],
      sexualPreferences: [[]]
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const profileData: ProfileCreateDto = this.profileForm.value;

      this.profileService.createProfile(profileData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur lors de la création du profil :', error);
        }
      });
    }
  }
}