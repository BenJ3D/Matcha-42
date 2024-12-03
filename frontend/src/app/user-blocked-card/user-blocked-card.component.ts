import {Component, Input} from '@angular/core';
import {UserResponseDto} from "../../DTOs/users/UserResponseDto";
import {UserLightResponseDto} from "../../DTOs/users/UserLightResponseDto";
import {MatCardImage} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {ProfileService} from "../../services/profile.service";
import {Router} from "@angular/router";
import {DatePipe, SlicePipe} from "@angular/common";
import {BlockedUserResponseDto} from "../../DTOs/users/BlockedUserResponseDto";

@Component({
  selector: 'app-user-blocked-card',
  standalone: true,
  imports: [
    MatCardImage,
    MatIcon,
    SlicePipe,
    DatePipe
  ],
  templateUrl: './user-blocked-card.component.html',
  styleUrl: './user-blocked-card.component.scss'
})
export class UserBlockedCardComponent {
  constructor(
    protected profileService: ProfileService,
    protected router: Router,
  ) {
  }

  @Input() user!: BlockedUserResponseDto;


}
