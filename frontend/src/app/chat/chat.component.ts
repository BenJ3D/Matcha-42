// chat.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ChatUserDto } from '../../DTOs/chat/ChatUserDto';
import { MessageDto } from '../../DTOs/chat/MessageDto';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ConversationComponent } from '../conversation/conversation.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {MatLine} from "@angular/material/core";

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    ConversationComponent,
    MatCardModule,
    MatButtonModule,
    MatLine,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: MessageDto[] = [];
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

    // S'abonner aux messages globaux
    this.messageSubscription = this.socketService.messages$.subscribe((msg) => {
      // Vérifier si le message concerne l'utilisateur sélectionné
      if (
        (msg.owner_user === this.getCurrentUserId() && msg.target_user === this.selectedUser?.id) ||
        (msg.owner_user === this.selectedUser?.id && msg.target_user === this.getCurrentUserId())
      ) {
        this.messages.push(msg);
      }

      // Mettre à jour les indicateurs de messages non lus
      this.updateUnreadCounts(msg);
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
    // Réinitialiser le compteur de non lus pour cet utilisateur
    user.unread = 0;
  }

  /**
   * Récupère les messages de la conversation avec un utilisateur spécifique.
   * @param userId L'ID de l'utilisateur avec qui récupérer les messages.
   */
  fetchMessages(userId: number): void {
    this.http.get<MessageDto[]>(`http://localhost:8000/api/messages/${userId}`).subscribe({
      next: (msgs) => {
        this.messages = msgs;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des messages:', error);
      },
    });
  }

  /**
   * Met à jour le compteur de messages non lus pour les utilisateurs.
   * @param msg Le message reçu.
   */
  private updateUnreadCounts(msg: MessageDto): void {
    const otherUserId =
      msg.owner_user === this.getCurrentUserId() ? msg.target_user : msg.owner_user;
    const chatUser = this.chatUsers.find((user) => user.id === otherUserId);

    if (chatUser && otherUserId !== this.selectedUser?.id) {
      chatUser.unread = (chatUser.unread || 0) + 1;
    }
  }

  /**
   * Envoie un message à l'utilisateur sélectionné via une requête HTTP POST.
   */
  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedUser) {
      const messageDto = {
        target_user: this.selectedUser.id,
        content: this.newMessage.trim(),
      };

      this.http.post<MessageDto>('http://localhost:8000/api/messages', messageDto).subscribe({
        next: (msg) => {
          // Ajouter le message à la liste localement
          this.messages.push(msg);
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

  /**
   * Récupère l'ID de l'utilisateur actuel à partir de AuthService.
   */
  getCurrentUserId(): number {
    return this.authService.getCurrentUserId();
  }
}
