import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

interface Message {
  id: number;
  text: string;
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
export class ConversationComponent {
  @Input() user: any;
  @Output() close = new EventEmitter<void>();

  messages: Message[] = [
    { id: 1, text: 'Hey there!', sender: 'other', timestamp: new Date(Date.now() - 3600000) },
    { id: 2, text: 'Hi! How are you?', sender: 'user', timestamp: new Date(Date.now() - 3540000) },
    { id: 3, text: 'I\'m good, thanks! How about you?', sender: 'other', timestamp: new Date(Date.now() - 3480000) },
  ];

  newMessage: string = '';

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        id: this.messages.length + 1,
        text: this.newMessage,
        sender: 'user',
        timestamp: new Date()
      });
      this.newMessage = '';
    }
  }
}
