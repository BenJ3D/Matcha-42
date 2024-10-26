import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ConversationComponent } from '../conversation/conversation.component';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { CreateMessageDto } from '../../DTOs/chat/CreateMessageDto';
import { UserResponseDto } from '../../DTOs/users/UserResponseDto';
import {ChatUserDto} from "../../DTOs/chat/ChatUserDto";

interface ChatMessage {
  from: string;
  content: string;
  timestamp: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    // Importer les modules nécessaires Angular Material et autres
    CommonModule,
    MatListModule,
    MatIconModule,
    ConversationComponent,
    // ...
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  chatUsers : ChatUserDto[] = [
    // Exemple de liste d'utilisateurs, vous devriez la récupérer de votre backend
    { id: 1, name: 'Alice', unread: 2 },
    { id: 2, name: 'Bob', unread: 0 },
    { id: 3, name: 'Charlie', unread: 1 },
  ];
  selectedUser: ChatUserDto | null = null;
  newMessage: string = '';
  private messageSubscription!: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Écouter les événements 'chat message'
    this.messageSubscription = this.socketService.on<ChatMessage>('message').subscribe((msg) => {
      this.messages.push(msg);
    });
  }

  selectConversation(user: ChatUserDto): void {
    this.selectedUser = user;
    // Optionnel : marquer les messages comme lus
  }

  closeConversation(): void {
    this.selectedUser = null;
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedUser) {
      const messageDto: CreateMessageDto = {
        target_user: this.selectedUser.id,
        content: this.newMessage.trim(),
      };
      //TODO: envoyer via route http

      // this.socketService.emit('send message', messageDto);
      // this.messages.push({
      //   from: 'You',
      //   content: this.newMessage.trim(),
      //   timestamp: new Date().toISOString(),
      // });
      // this.newMessage = '';
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}

