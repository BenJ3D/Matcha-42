import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { Message } from '../../../models/Message';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../services/socket.service';
import { AuthService } from '../../../services/auth.service';
import { MessageDto } from '../../../DTOs/chat/MessageDto';
import { CreateMessageDto } from '../../../DTOs/chat/CreateMessageDto';
import { UserLightResponseDto } from "../../../DTOs/users/UserLightResponseDto";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { ApiService } from "../../../services/api.service";
import { ProfileService } from "../../../services/profile.service";
import { Router } from "@angular/router";
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltip,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationComponent implements OnInit, OnDestroy {
  @Input() user: UserLightResponseDto | null = null;
  @Input() messages: MessageDto[] = [];
  @Output() close = new EventEmitter<void>();

  newMessage: string = '';
  private messageSubscription!: Subscription;
  messageLikes = new Map<string, boolean>();

  @ViewChild('messageList') messageList!: ElementRef;

  constructor(
    private socketService: SocketService,
    private apiService: ApiService,
    private authService: AuthService,
    protected profileService: ProfileService,
    protected router: Router,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.messageSubscription = this.socketService.messages$.subscribe((msg) => {
      this.scrollToBottom();
      this.cdr.markForCheck();
    });

    this.scrollToBottom();
  }

  toggleLike(message: Message) {
    if (message.owner_user === this.getCurrentUserId()) {
      return;
    }

    const endpoint = `messages/${message.message_id}/${message.is_liked ? 'unlike' : 'like'}`;

    this.apiService.post(endpoint, {}).subscribe({
      next: () => {
        message.is_liked = !message.is_liked;
      },
    });
  }

  isMessageLiked(messageId: string): boolean {
    return this.messageLikes.get(messageId) || false;
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.user) {
      const messageDto: CreateMessageDto = {
        target_user: this.user.id,
        content: this.newMessage.trim(),
      };

      this.apiService.post<MessageDto>('messages', messageDto).subscribe({
        next: (msg) => {
          this.newMessage = '';
          this.scrollToBottom();
          this.cdr.detectChanges();
        },
      });
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageList && this.messageList.nativeElement) {
        this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
      }
    }, 100);
  }


  closeConversation(): void {
    this.close.emit();
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  getCurrentUserId(): number {
    return this.authService.getCurrentUserId();
  }
}
