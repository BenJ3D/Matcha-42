import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CreateMessageDto } from '../../DTOs/chat/CreateMessageDto';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import {ChatUserDto} from "../../DTOs/chat/ChatUserDto";
import {MessageDto} from "../../DTOs/chat/MessageDto";

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatInputModule],
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit, OnDestroy {
  @Input() user: ChatUserDto | null = null;
  @Output() close = new EventEmitter<void>();

  messages: MessageDto[] = [
    { message_id: 1, content: 'Hey there!', target_user: 2, owner_user: 4,created_at: new Date(Date.now() - 3600000) },
    { message_id: 2, content: 'Hi! How are you?', target_user: 3, owner_user: 4,created_at: new Date(Date.now() - 3540000) },
    { message_id: 3, content: 'I\'m good, thanks! How about you?', target_user: 2, owner_user: 4,created_at: new Date(Date.now() - 3480000) },
  ];

  newMessage: string = '';
  private messageSubscription!: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Écouter les nouveaux messages spécifiques à la conversation
    this.messageSubscription = this.socketService.on<MessageDto>('message').subscribe((msg) => {
      if (msg.target_user !== this.user?.id && this.user && msg.content) { // Filtrer les messages reçus
        this.messages.push(msg);
      }
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.user) {
      const messageDto: CreateMessageDto = {
        target_user: this.user.id,
        content: this.newMessage.trim(),
      };
      // this.socketService.emit('message', messageDto);
      // this.messages.push({
      //   message_id: this.messages.length + 1,
      //   content: this.newMessage.trim(),
      //   owner_user: 1,
      //   target_user: 2,
      //   created_at: new Date()
      // });

      this.newMessage = '';
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
