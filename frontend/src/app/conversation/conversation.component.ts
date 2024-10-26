// src/app/conversation/conversation.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CreateMessageDto } from '../../DTOs/chat/CreateMessageDto';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';
import { UserResponseDto } from '../../DTOs/users/UserResponseDto';
import {ChatUserDto} from "../../DTOs/chat/ChatUserDto";

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'other';
  timestamp: Date;
}

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

  messages: Message[] = [
    { id: 1, content: 'Hey there!', sender: 'other', timestamp: new Date(Date.now() - 3600000) },
    { id: 2, content: 'Hi! How are you?', sender: 'user', timestamp: new Date(Date.now() - 3540000) },
    { id: 3, content: 'I\'m good, thanks! How about you?', sender: 'other', timestamp: new Date(Date.now() - 3480000) },
  ];

  newMessage: string = '';
  private messageSubscription!: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Écouter les nouveaux messages spécifiques à la conversation
    this.messageSubscription = this.socketService.on<Message>('chat message').subscribe((msg) => {
      if (msg.sender !== 'user' && this.user && msg.content) { // Filtrer les messages reçus
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
      this.socketService.emit('send message', messageDto);
      this.messages.push({
        id: this.messages.length + 1,
        content: this.newMessage.trim(),
        sender: 'user',
        timestamp: new Date()
      });
      this.newMessage = '';
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}
