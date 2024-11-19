import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {ProfileService} from '../../services/profile.service';
import {UserResponseDto} from '../../DTOs/users/UserResponseDto';
import {Gender} from '../../models/Genders';
import {Tag} from '../../models/Tags';
import {Photo} from '../../models/Photo';

import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {finalize} from "rxjs";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class ProfileComponent implements OnInit {
  user: UserResponseDto | null = null;
  genders: Gender[] = [];
  tags: Tag[] = [];
  profileId: number | null = null;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    // this.loadUserProfile();
    this.loadGenders();
    this.subscribeToQueryParams();
  }

  subscribeToQueryParams() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      this.profileId = id ? parseInt(id, 10) : null;
      if (id == null) {
        console.log('ID est null');
        this.loadUserProfile();
      } else {
        this.loadUserProfileById();
      }
    });
  }

  loadUserProfile() {
    this.profileService.getMyProfile().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
      },
    });
  }

  loadUserProfileById() {
    if (this.profileId) {
      this.profileService.getUserById(this.profileId).subscribe({
        next: (user) => {
          if (!user) {
            this.router.navigate(['/profile']);
          }
          this.user = user;
        },
        error: (error) => {
          console.error('Error fetching user profile:', error);
          if (error.status === 401) {
            this.router.navigate(['/home']);
          }
        },
      });
    }
  }

  loadGenders() {
    this.profileService.getGenders().subscribe({
      next: (genders) => {
        this.genders = genders;
      },
      error: (error) => {
        console.error('Error fetching genders:', error);
      },
    });
  }

  getGenderName(genderId: number): string {
    const gender = this.genders.find((g) => g.gender_id === genderId);
    return gender ? gender.name : 'Unknown';
  }

  getSexualPreferencesNames(preferences: Gender[] | undefined): string {
    if (!preferences) return '';
    return preferences.map((g) => g.name).join(', ');
  }

  onEditProfile() {
    this.router.navigate(['/edit-profile']);
  }

  deletePhoto(photo: Photo) {
    if (confirm('Are you sure you want to delete this photo?')) {
      this.profileService.deletePhoto(photo.photo_id).subscribe({
        next: () => {
          if (this.user) {
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

  // onDeleteProfile() {
  //   if (
  //     confirm(
  //       'Are you sure you want to delete your profile? This action cannot be undone.'
  //     )
  //   ) {
  //     this.profileService.deleteProfile().subscribe({
  //       next: () => {
  //         console.log('Profile deleted successfully');
  //         this.router.navigate(['/edit-profile']);
  //       },
  //       error: (error) => {
  //         console.error('Error deleting profile:', error);
  //       },
  //     });
  //   }
  // }

  toggleLike() {
    if (this.user?.isLiked) {
      this.profileService.removeLikeUser(this.user.id).subscribe({
        next: () => {
          this.loadUserProfileById();
        }
      });
    } else if (this.user?.isLiked === false) {
      this.profileService.addLikeUser(this.user.id).subscribe({
        next: () => {
          if (this.user?.isBlocked) {
            this.profileService.unblockUser(this.user.id)
              .pipe(
                finalize(() => {
                  this.loadUserProfileById();
                })
              )
              .subscribe({});
          } else {
            this.loadUserProfileById();
          }
        }
      });
    }
  }


  toggleUnlike() {
    if (this.user?.isUnliked) {
      this.profileService.removeUnlikeUser(this.user.id).subscribe({
        next: () => {
          this.loadUserProfileById();
        }
      })
    } else if (this.user?.isUnliked == false) {
      this.profileService.addUnlikeUser(this.user.id).subscribe({
        next: () => {
          this.loadUserProfileById();
        }
      })
    }
  }

  toggleBlock() {
    if (this.user?.isBlocked) {
      this.profileService.unblockUser(this.user.id).subscribe({
        next: () => {
          this.loadUserProfileById();
        }
      })
    } else if (this.user?.isBlocked == false) {
      this.profileService.blockUser(this.user.id).subscribe({
        next: () => {
          this.loadUserProfileById();
        }
      })
    }
  }

  toggleReportFake() {
    if (this.user?.isFakeReported) {
      this.profileService.unreportUser(this.user.id).subscribe({
        next: () => {
          this.loadUserProfileById();
        }
      })
    } else if (this.user?.isFakeReported == false) {
      this.profileService.reportUser(this.user.id).subscribe({
        next: () => {
          this.loadUserProfileById();
        }
      })
    }
  }
}
