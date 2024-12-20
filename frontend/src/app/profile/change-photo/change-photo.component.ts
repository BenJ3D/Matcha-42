import { Component, Input, OnInit } from '@angular/core';
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatStepLabel } from "@angular/material/stepper";
import { NgForOf, NgIf } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Photo } from "../../../models/Photo";
import { ProfileService } from "../../../services/profile.service";
import { UserResponseDto } from "../../../DTOs/users/UserResponseDto";

@Component({
  selector: 'app-change-photo',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatIconButton,
    MatStepLabel,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './change-photo.component.html',
  styleUrl: './change-photo.component.scss'
})
export class ChangePhotoComponent implements OnInit {
  @Input() backToProfile!: () => void;
  @Input() user!: UserResponseDto | null;

  photoForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.photoForm = this.fb.group({});
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
          this.isLoading = false;
        });
    }
  }

  setAsMainPhoto(photo: Photo) {
    if (!photo || !photo.photo_id) {
      return;
    }

    this.profileService.setMainPhoto(photo.photo_id).subscribe({
      next: () => {
        if (this.user) {
          this.user.main_photo_id = photo.photo_id;
        }
      },
    });
  }

  deletePhoto(photo: Photo) {
    if (!photo || !photo.photo_id) {
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
      });
    }
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
  }

}
