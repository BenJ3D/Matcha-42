import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { MessageDto } from '../../DTOs/chat/MessageDto';
import { UserLightResponseDto } from "../../DTOs/users/UserLightResponseDto";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { ConversationComponent } from "./conversation/conversation.component";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from '../../services/api.service';
import { DashboardComponent } from "../dashboard/dashboard.component";

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
  unreadUserIds: number[] = [];

  public isMobile: boolean = false;

  private messageSubscription!: Subscription;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private apiService: ApiService,
    private dashboard: DashboardComponent,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.checkIfMobile();

    this.socketService.on('reload_chat').subscribe(() => {
      this.fetchMatches();
    });
    this.socketService.on('refresh_message').subscribe(() => {
      if (this.selectedUser)
        this.fetchMessages(this.selectedUser.id);
    });
    this.fetchMatches();


    this.route.queryParams.subscribe(params => {
      const userId = +params['id'];
      if (userId) {
        this.selectConversationById(userId);
      }
    });

    this.messageSubscription = this.socketService.messages$.subscribe((msg) => {
      if (
        (msg.owner_user === this.getCurrentUserId() && msg.target_user === this.selectedUser?.id) ||
        (msg.owner_user === this.selectedUser?.id && msg.target_user === this.getCurrentUserId())
      ) {
        const messageExists = this.messages.some(m => m.message_id === msg.message_id);
        if (!messageExists) {
          this.messages = [...this.messages, msg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }
      }
      if (msg.owner_user == this.selectedUser?.id) {
        this.socketService.emit('conversation_read', { data: msg.owner_user });
      }
    });

    this.dashboard.unreadChatIdsMarker$.subscribe(userIds => {
      this.unreadUserIds = userIds;
    })

  }

  checkIfUnreadChat(userId: number) {
    return this.unreadUserIds.includes(userId);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 600;
    this.cdr.detectChanges(); // Rafraîchir la détection des changements
  }

  selectConversationById(userId: number): void {
    const user = this.chatUsers.find(u => u.id === userId);
    if (user) {
      this.selectConversation(user);
    } else {
      this.fetchMatches().then(() => {
        const userAfterFetch = this.chatUsers.find(u => u.id === userId);
        if (userAfterFetch) {
          this.selectConversation(userAfterFetch);
        } else {
          console.warn(`Utilisateur avec ID ${userId} non trouvé.`);
        }
      });
    }
  }

  fetchMatches(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.get<UserLightResponseDto[]>('matches').subscribe({
        next: (users) => {
          this.chatUsers = users;
          this.cdr.detectChanges();
          resolve();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des matches:', error);
          reject(error);
        },
      });
    });
  }

  selectConversation(user: UserLightResponseDto): void {
    this.selectedUser = user;
    this.fetchMessages(user.id);
    if (this.unreadUserIds.includes(user.id)) {
      this.socketService.emit('conversation_read', { data: user.id });
      this.unreadUserIds = this.unreadUserIds.filter(elem => elem !== user.id);
    }
  }

  fetchMessages(userId: number): void {
    this.apiService.get<any>(`messages/${userId}`).subscribe({
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

  closeConversation(): void {
    this.selectedUser = null;
    this.messages = [];
    this.cdr.detectChanges();
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
