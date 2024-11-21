import {Injectable, OnDestroy} from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {AuthService} from './auth.service';
import {UserResponseDto} from '../DTOs/users/UserResponseDto';
import {Message} from "../models/Message";
import {MessageDto} from "../DTOs/chat/MessageDto";
import {environment} from "../environment/environment";

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private socket!: Socket;
  private socketConnected$ = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.socketConnected$.asObservable();

  constructor(private authService: AuthService) {
    // Écouter les changements d'authentification pour établir ou fermer la connexion
    this.authService.user$.subscribe((user: UserResponseDto | null) => {
      if (user && user.is_verified) {
        const token = localStorage.getItem('accessToken');
        if (!token)
          return;
        this.connectSocket(token);
      } else {
        this.disconnectSocket();
      }
    });
  }

  private connectSocket(token: string): void {
    if (this.socket && this.socket.connected) {
      return;
    }

    const apiURL = environment.apiURL; // URL de base de l'API (par exemple, http://192.168.1.50:8000)
    const parsedURL = new URL(apiURL);

// Remplacer 'http' par 'ws' ou 'https' par 'wss'
    parsedURL.protocol = parsedURL.protocol === 'https:' ? 'wss:' : 'ws:';
    console.log(parsedURL.toString());

    // Supprimer '/api' de la fin du chemin
    parsedURL.pathname = parsedURL.pathname.replace(/\/api$/, '');
    console.log(parsedURL.toString());

    this.socket = io(parsedURL.toString(), {
      transports: ['websocket'],
      auth: {
        token: token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
      this.socketConnected$.next(true);
      this.registerSocketListeners();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Déconnecté du serveur Socket.IO:', reason);
      this.socketConnected$.next(false);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Erreur de connexion Socket.IO:', error);
      this.socketConnected$.next(false);
    });

  }


  private disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socketConnected$.next(false);
    }
  }

  // Méthode pour émettre des événements
  emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  // Méthode pour écouter des événements
  on<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (this.socket) {
        this.socket.on(event, (data: T) => {
          subscriber.next(data);
        });
      }

      // Nettoyage lorsque l'abonné se désabonne
      return () => {
        if (this.socket) {
          this.socket.off(event);
        }
      };
    });
  }

  ngOnDestroy(): void {
    this.disconnectSocket();
  }


  private messagesSubject = new Subject<MessageDto>();
  public messages$ = this.messagesSubject.asObservable();

  private registerSocketListeners(): void {
    this.socket.on('message', (data: MessageDto) => {
      this.messagesSubject.next(data);
    });

    // this.socket.on('notification', (data: NotificationsReceiveDto) => {
    // });
    // this.socket.on('fetch_notifications', () => {
    // });


    //TODO: ajouter event notification + des Observables appropriés
  }

}
