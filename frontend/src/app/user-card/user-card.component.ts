import { Component, Input } from '@angular/core';
import { UserResponseDto } from "../../DTOs/users/UserResponseDto";
import { UserLightResponseDto } from "../../DTOs/users/UserLightResponseDto";
import { MatCardImage } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { ProfileService } from "../../services/profile.service";
import { Router } from "@angular/router";
import { SlicePipe } from "@angular/common";

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [
    MatCardImage,
    MatIcon,
    MatIconButton,
    SlicePipe
  ],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
  constructor(
    protected profileService: ProfileService,
    protected router: Router,
  ) {
  }

  @Input() user!: UserLightResponseDto;
  @Input() loadUserCallBack!: () => void;

  goToProfile(userId: number) {
    this.router.navigate(['/profile'], { queryParams: { id: userId } });
    this.loadUserCallBack();
  }
}
