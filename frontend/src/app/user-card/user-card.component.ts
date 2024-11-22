import {Component, Input} from '@angular/core';
import {UserResponseDto} from "../../DTOs/users/UserResponseDto";
import {UserLightResponseDto} from "../../DTOs/users/UserLightResponseDto";

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.scss'
})
export class UserCardComponent {
  @Input() user!: UserLightResponseDto;


}
