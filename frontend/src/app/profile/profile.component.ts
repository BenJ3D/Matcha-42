import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {AuthService} from "../../services/auth.service";
import {ChangeEmailComponent} from "./change-email/change-email.component";
import {MatTooltip} from "@angular/material/tooltip";
import {ChangeNameComponent} from "./change-name/change-name.component";
import {UserLightListComponent} from "../user-light-list/user-light-list.component";
import {MatTabsModule} from "@angular/material/tabs";
import {SocketService} from "../../services/socket.service";
import {EditProfileV2} from "./edit-profile-v2/edit-profile-v2.component";
import {UserBlockedListComponent} from "../user-blocked-list/user-blocked-list.component";

export enum EEditStep {
  'idle',
  'create',
  'edit',
  'email',
  'name',
}

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
    ChangeEmailComponent,
    MatTooltip,
    ChangeNameComponent,
    UserLightListComponent,
    MatTabsModule,
    EditProfileV2,
    UserBlockedListComponent,
  ],
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: UserResponseDto | null = null;
  genders: Gender[] = [];
  tags: Tag[] = [];
  profileId: number | null = null;
  private profileInterval: ReturnType<typeof setInterval> | null = null;
  public editStep: EEditStep = EEditStep.idle;
  hasMainPhoto: boolean = false;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private socketService: SocketService,
  ) {
  }

  ngOnInit() {
    this.loadGenders();
    this.subscribeToQueryParams();
    this.loadUserProfile();
  }

  ngOnDestroy() {
    this.clearProfileInterval();
  }

  initializeStep() {
    if (!this.user?.profile_id) {
      this.editStep = EEditStep.create;
    } else {
      this.editStep = EEditStep.idle;
    }
  }

  subscribeToQueryParams() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      this.profileId = id ? parseInt(id, 10) : null;
      if (id == null) {
        this.loadUserProfile();
      } else {
        this.loadUserProfileById();
      }
    });
  }

  loadUserProfile() {
    this.clearProfileInterval();
    this.profileService.getMyProfile().subscribe({
      next: (user) => {
        if (!this.profileId) {
          this.user = user;
          this.initializeStep();
        } else {
          this.hasMainPhoto = user.main_photo_url != null;
        }
      },
    });
  }

  loadUserProfileById() {
    if (this.profileId) {
      this.profileService.getUserById(this.profileId).subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
            this.setProfileInterval();
            this.profileService.visitedProfile(user.id).subscribe();
          } else {
            this.router.navigate(['/profile']);
          }
        },
        error: (error) => {
          if (error.status === 401) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/profile']);
          }
        }
      });
    }
  }

  loadGenders() {
    this.profileService.getGenders().subscribe({
      next: (genders) => {
        this.genders = genders;
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
    this.editStep = EEditStep.edit;
  }

  onChangeEmail() {
    this.editStep = EEditStep.email;
  }

  onChangeName() {
    this.editStep = EEditStep.name;
  }

  resetStepToIdle() {
    this.loadUserProfile();
    this.editStep = EEditStep.idle;
  }

  onPhotoSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const uploadPromises = Array.from(files).map((file) =>
        this.profileService.uploadPhoto(file).toPromise()
      );

      Promise.all(uploadPromises)
        .then((newPhotos) => {
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
          this.loadUserProfile();
        }
      },
    });
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
          this.loadUserProfile();

        },
      });
    }
  }

  loggout() {
    this.authService.logout();
  }

  readConversationIfMatched() {
    if (this.user && this.user.isMatched) {
      this.socketService.emit('conversation_read', {data: this.user.id});
    }
  }

  toggleLike() {
    this.readConversationIfMatched();
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
    this.readConversationIfMatched();
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

  onDeleteProfile() {
    if (
      confirm(
        'Are you sure you want to delete your profile? This action cannot be undone.'
      )
    ) {
      this.profileService.deleteProfile().subscribe({
        next: () => {
          this.router.navigate(['/create-profile']);
        },
      });
    }
  }

  onDeleteUser() {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      this.profileService.deleteUser().subscribe({
        next: () => {
          this.loggout()
        },
      });
    }
  }

  toggleBlock() {
    this.readConversationIfMatched();
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

  private setProfileInterval() {
    if (this.profileId) {
      this.clearProfileInterval();

      this.profileInterval = setInterval(() => {
        this.profileService.getUserById(this.profileId!).subscribe({
          next: (user) => {
            if (user) {
              this.user = user;
            } else {
              this.clearProfileInterval();
              this.router.navigate(['/profile']);
            }
          },
          error: (error) => {
            this.clearProfileInterval();
            if (error.status === 401) {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/profile']);
            }
          }
        });
      }, 5000);
    }
  }

  private clearProfileInterval() {
    if (this.profileInterval) {
      clearInterval(this.profileInterval);
      this.profileInterval = null;
    }
  }


  protected readonly EEditStep = EEditStep;
  protected readonly MatTooltip = MatTooltip;
}
