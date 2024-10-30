import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { MessageDto } from '../../DTOs/chat/MessageDto';
import { UserLightResponseDto } from "../../DTOs/users/UserLightResponseDto";
import {MatCardModule} from "@angular/material/card";
import {MatListModule} from "@angular/material/list";
import {ConversationComponent} from "./conversation/conversation.component";
import {CommonModule, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [
    CommonModule,
    MatListModule,
    MatCardModule,
    ConversationComponent,
  ],
  standalone: true
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: MessageDto[] = [];
  chatUsers: UserLightResponseDto[] = [];
  selectedUser: UserLightResponseDto | null = null;
  newMessage: string = '';
  public isMobile: boolean = false;

  private messageSubscription!: Subscription;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkIfMobile();

    // Récupérer la liste des matches via l'API
    this.fetchMatches();

    // S'abonner aux messages globaux
    this.messageSubscription = this.socketService.messages$.subscribe((msg) => {
      // Vérifier si le message concerne l'utilisateur sélectionné
      if (
        (msg.owner_user === this.getCurrentUserId() && msg.target_user === this.selectedUser?.id) ||
        (msg.owner_user === this.selectedUser?.id && msg.target_user === this.getCurrentUserId())
      ) {
        const messageExists = this.messages.some(m => m.message_id === msg.message_id);
        if (!messageExists) {
          this.messages = [...this.messages, msg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          // Vous pouvez retirer `this.cdr.detectChanges();` ici car le changement de référence devrait suffire
        }
      }

      // Mettre à jour les indicateurs de messages non lus
      this.updateUnreadCounts(msg);
    });
  }

  /**
   * Détecte les changements de taille de la fenêtre.
   * Utilisé par le décorateur @HostListener.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile();
  }

  /**
   * Vérifie si la taille de la fenêtre correspond à un écran mobile.
   */
  checkIfMobile() {
    this.isMobile = window.innerWidth <= 600;
    this.cdr.detectChanges(); // Rafraîchir la détection des changements
  }

  /**
   * Récupère la liste des utilisateurs avec qui l'utilisateur est en match.
   */
  fetchMatches(): void {
    this.http.get<UserLightResponseDto[]>('http://localhost:8000/api/matches').subscribe({
      next: (users) => {
        this.chatUsers = users;
        this.cdr.detectChanges();
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
  selectConversation(user: UserLightResponseDto): void {
    this.selectedUser = user;
    this.fetchMessages(user.id);
    // Réinitialiser le compteur de non lus pour cet utilisateur
    if (this.isMobile) {
      // Sur mobile, cacher la liste des utilisateurs
      // La classe 'hidden' est gérée via [class.hidden] dans le template
    }
  }

  /**
   * Récupère les messages de la conversation avec un utilisateur spécifique.
   * @param userId L'ID de l'utilisateur avec qui récupérer les messages.
   */
  fetchMessages(userId: number): void {
    this.http.get<any>(`http://localhost:8000/api/messages/${userId}`).subscribe({
      next: (msgs) => {
        this.messages = msgs.messages;
        // Trier les messages par date de création
        this.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        this.cdr.detectChanges();
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

    // if (chatUser && otherUserId !== this.selectedUser?.id) {
    //   chatUser.unread = (chatUser.unread || 0) + 1;
    // }
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
          this.newMessage = '';
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
   * Ferme la conversation actuelle.
   */
  closeConversation(): void {
    this.selectedUser = null;
    this.messages = [];
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    // Aucun abonnement supplémentaire à nettoyer
  }

  /**
   * Récupère l'ID de l'utilisateur actuel à partir de AuthService.
   */
  getCurrentUserId(): number {
    return this.authService.getCurrentUserId();
  }

}
