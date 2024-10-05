import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ConversationComponent } from '../conversation/conversation.component';

interface ChatUser {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, ConversationComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  chatUsers: ChatUser[] = [
    { id: 1, name: 'Alice', lastMessage: 'Hey, how are you?', timestamp: new Date(), unread: 2 },
    { id: 2, name: 'Bob', lastMessage: 'See you tomorrow!', timestamp: new Date(Date.now() - 3600000), unread: 0 },
    { id: 3, name: 'Charlie', lastMessage: 'That sounds great!', timestamp: new Date(Date.now() - 86400000), unread: 1 },
  ];

  selectedUser: ChatUser | null = null;

  selectConversation(user: ChatUser) {
    this.selectedUser = user;
  }

  closeConversation() {
    this.selectedUser = null;
  }
}
