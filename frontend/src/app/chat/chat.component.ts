import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ConversationComponent } from '../conversation/conversation.component';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { CreateMessageDto } from '../../DTOs/chat/CreateMessageDto';
import { UserResponseDto } from '../../DTOs/users/UserResponseDto';
import { ChatUserDto } from "../../DTOs/chat/ChatUserDto";
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  message_id: number;
  content: string;
  created_at: string;
  owner_user: number;
  target_user: number;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    ConversationComponent,
    // Ajoutez d'autres modules nécessaires
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  chatUsers: ChatUserDto[] = [];
  selectedUser: ChatUserDto | null = null;
  newMessage: string = '';
  private messageSubscription!: Subscription;
  private userSubscription!: Subscription;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Récupérer la liste des matches via l'API
    this.fetchMatches();

    // Écouter les événements 'message' émis par le backend
    this.messageSubscription = this.socketService.on<ChatMessage>('message').subscribe((msg) => {
      // Vérifier si le message concerne l'utilisateur sélectionné
      if (
        (msg.owner_user === this.authService.getCurrentUserId() && msg.target_user === this.selectedUser?.id) ||
        (msg.owner_user === this.selectedUser?.id && msg.target_user === this.authService.getCurrentUserId())
      ) {
        this.messages.push(msg);
      }
    });
  }

  /**
   * Récupère la liste des utilisateurs avec qui l'utilisateur est en match.
   */
  fetchMatches(): void {
    this.http.get<ChatUserDto[]>('http://localhost:8000/api/matches').subscribe({
      next: (users) => {
        this.chatUsers = users;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des matches:', error);
      },
    });
  }

  /**
   * Sélectionne une conversation avec un utilisateur spécifique.
   * @param user L'utilisateur sélectionné.
   */
  selectConversation(user: ChatUserDto): void {
    this.selectedUser = user;
    this.fetchMessages(user.id);
    // Optionnel : marquer les messages comme lus
  }

  /**
   * Récupère les messages de la conversation avec un utilisateur spécifique.
   * @param userId L'ID de l'utilisateur avec qui récupérer les messages.
   */
  fetchMessages(userId: number): void {
    this.http.get<ChatMessage[]>(`http://localhost:8000/api/messages/${userId}`).subscribe({
      next: (msgs) => {
        this.messages = msgs;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des messages:', error);
      },
    });
  }

  /**
   * Envoie un message à l'utilisateur sélectionné.
   */
  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedUser) {
      const messageDto: CreateMessageDto = {
        target_user: this.selectedUser.id,
        content: this.newMessage.trim(),
      };

      this.http.post<ChatMessage>('http://localhost:8000/api/messages', messageDto).subscribe({
        next: (msg) => {
          // Ajouter le message à la liste localement
          this.messages.push(msg);
          // Émettre l'événement via SocketService si nécessaire
          // this.socketService.emit('send message', msg);
          this.newMessage = '';
        },
        error: (error) => {
          console.error('Erreur lors de l\'envoi du message:', error);
        },
      });
    }
  }

  /**
   * Ferme la conversation actuelle.
   */
  closeConversation(): void {
    this.selectedUser = null;
    this.messages = [];
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
