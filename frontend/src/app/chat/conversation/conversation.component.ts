import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../services/socket.service';
import { AuthService } from '../../../services/auth.service';
import { MessageDto } from '../../../DTOs/chat/MessageDto';
import { CreateMessageDto } from '../../../DTOs/chat/CreateMessageDto';
import { HttpClient } from '@angular/common/http';
import { UserLightResponseDto } from "../../../DTOs/users/UserLightResponseDto";
import { MatIconModule} from "@angular/material/icon";
import {CommonModule, DatePipe, NgClass, NgForOf} from "@angular/common";
import { MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import { MatInputModule} from "@angular/material/input";

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConversationComponent implements OnInit, OnDestroy {
  @Input() user: UserLightResponseDto | null = null;
  @Input() messages: MessageDto[] = [];
  @Output() close = new EventEmitter<void>();

  newMessage: string = '';
  private messageSubscription!: Subscription;

  @ViewChild('messageList') messageList!: ElementRef;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Écouter les messages globaux
    this.messageSubscription = this.socketService.messages$.subscribe((msg) => {
      if (
        (msg.owner_user === this.getCurrentUserId() && msg.target_user === this.user?.id) ||
        (msg.owner_user === this.user?.id && msg.target_user === this.getCurrentUserId())
      ) {
        const messageExists = this.messages.some(m => m.message_id === msg.message_id);
        if (!messageExists) {
          this.messages.push(msg);
          this.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          this.scrollToBottom();
          this.cdr.detectChanges();
        }
      }
    });

    // Scroll au bas lors du chargement initial
    this.scrollToBottom();
  }

  /**
   * Envoie un message à l'utilisateur sélectionné via une requête HTTP POST.
   */
  sendMessage(): void {
    if (this.newMessage.trim() && this.user) {
      const messageDto: CreateMessageDto = {
        target_user: this.user.id,
        content: this.newMessage.trim(),
      };

      this.http.post<MessageDto>('http://localhost:8000/api/messages', messageDto).subscribe({
        next: (msg) => {
          this.newMessage = '';
          this.scrollToBottom();
          this.cdr.detectChanges();
          // Le message sera ajouté via le socket, donc pas besoin de l'ajouter ici
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi du message:', error);
        },
      });
    }
  }

  /**
   * Fait défiler automatiquement la liste des messages vers le bas.
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageList && this.messageList.nativeElement) {
        this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
      }
    }, 100);
  }

  /**
   * Ferme la conversation.
   */
  closeConversation(): void {
    this.close.emit();
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  /**
   * Récupère l'ID de l'utilisateur actuel à partir de AuthService.
   */
  getCurrentUserId(): number {
    return this.authService.getCurrentUserId();
  }
}
