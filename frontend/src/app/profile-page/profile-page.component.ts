import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { UserResponseDto } from '../../DTOs/users/UserResponseDto';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {
  user: UserResponseDto | null = null;
  isOwnProfile: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.profileService.getUserById(id).subscribe(user => {
          this.user = user;
          this.authService.user$.subscribe(currentUser => {
            this.isOwnProfile = currentUser?.id === user.id;
          });
        });
      } else {
        this.profileService.getMyProfile().subscribe(user => {
          this.user = user;
          this.isOwnProfile = true;
        });
      }
    });
  }

  likeUser(userId: number): void {
    this.profileService.likeUser(userId).subscribe();
  }

  dislikeUser(userId: number): void {
    this.profileService.dislikeUser(userId).subscribe();
  }

  blockUser(userId: number): void {
    this.profileService.blockUser(userId).subscribe();
  }

  reportUser(userId: number): void {
    this.profileService.reportUser(userId).subscribe();
  }

  editProfile(): void {
    // Logique pour éditer le profil
  }

  deleteProfile(): void {
    // Logique pour supprimer le profil
  }
}
