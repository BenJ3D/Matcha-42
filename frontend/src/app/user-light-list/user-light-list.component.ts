import {Component, Input} from '@angular/core';
import {UserLightResponseDto} from "../../DTOs/users/UserLightResponseDto";
import {UserCardComponent} from "../user-card/user-card.component";
import {BlockedUserResponseDto} from "../../DTOs/users/BlockedUserResponseDto";

@Component({
  selector: 'app-user-light-list',
  standalone: true,
  imports: [
    UserCardComponent
  ],
  templateUrl: './user-light-list.component.html',
  styleUrl: './user-light-list.component.scss'
})
export class UserLightListComponent {
  @Input() users: UserLightResponseDto[] = [];
  @Input() ListTitle: string = '';
  @Input() loadUserCallBack!: () => void;

}
