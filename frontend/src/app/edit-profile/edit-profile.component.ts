// edit-profile.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Router } from '@angular/router';
import { ProfileCreateDto } from '../../DTOs/profiles/ProfileCreateDto';
import { Gender } from '../../models/Genders';
import { Tag } from '../../models/Tags';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  isLoading = false;
  genders: Gender[] = [];
  tags: Tag[] = [];

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

    this.profileService.getGenders().subscribe({
      next: (genders) => (this.genders = genders),
      error: (err) => console.error('Erreur lors du chargement des genres', err),
    });

    this.profileService.getTags().subscribe({
      next: (tags) => (this.tags = tags),
      error: (err) => console.error('Erreur lors du chargement des tags', err),
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const formValues = this.profileForm.value;

      const profileData: ProfileCreateDto = {
        biography: formValues.biography,
        gender: formValues.gender,
        sexualPreferences: formValues.sexualPreferences,
        age: formValues.age,
        tags: formValues.tags,
        // location: {
        //   city_name: formValues.city,
        // },
      };

      this.profileService.createProfile(profileData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur lors de la création du profil :', error);
        },
      });
    } else {
      console.warn('Formulaire invalide');
    }
  }
}
