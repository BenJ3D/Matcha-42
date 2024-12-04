import { Component, Input } from '@angular/core';
import { UserCardComponent } from "../user-card/user-card.component";
import { BlockedUserResponseDto } from "../../DTOs/users/BlockedUserResponseDto";
import { UserBlockedCardComponent } from "../user-blocked-card/user-blocked-card.component";

@Component({
  selector: 'app-user-blocked-list',
  standalone: true,
  imports: [
    UserCardComponent,
    UserBlockedCardComponent
  ],
  templateUrl: './user-blocked-list.component.html',
  styleUrl: './user-blocked-list.component.scss'
})
export class UserBlockedListComponent {
  @Input() users: BlockedUserResponseDto[] = [];
  @Input() ListTitle: string = '';

}