// conversation.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { ChatUserDto } from '../../DTOs/chat/ChatUserDto';
import { MessageDto } from '../../DTOs/chat/MessageDto';
import { CreateMessageDto } from '../../DTOs/chat/CreateMessageDto';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
})
export class ConversationComponent implements OnInit, OnDestroy {
  @Input() user: ChatUserDto | null = null;
  @Output() close = new EventEmitter<void>();

  messages: MessageDto[] = [];
  newMessage: string = '';
  private messageSubscription!: Subscription;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Écouter les messages globaux
    // this.fetchMessages(this.getCurrentUserId());
    this.messageSubscription = this.socketService.messages$.subscribe((msg) => {
      if (
        (msg.owner_user === this.getCurrentUserId() && msg.target_user === this.user?.id) ||
        (msg.owner_user === this.user?.id && msg.target_user === this.getCurrentUserId())
      ) {
        console.log('DBG message : ' + msg);

        this.messages.push(msg);
        console.log('DBG messages[] : ' + JSON.stringify(this.messages));
        this.scrollToBottom();
      }
    });
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
          // Ajouter le message localement
          this.newMessage = '';
          this.scrollToBottom();
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
      if (this.scrollContainer && this.scrollContainer.nativeElement) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 0);
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

  /**
   * Récupère les messages de la conversation avec un utilisateur spécifique.
   * Cette méthode peut être appelée depuis le composant parent.
   * @param userId L'ID de l'utilisateur avec qui récupérer les messages.
   */
  fetchMessages(userId: number): void {
    this.http.get<MessageDto[]>(`http://localhost:8000/api/messages/${userId}`).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des messages:', error);
      },
    });
  }
}
