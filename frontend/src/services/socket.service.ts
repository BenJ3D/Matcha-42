import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import { AuthService } from './auth.service';
import { UserResponseDto } from '../DTOs/users/UserResponseDto';
import { CreateMessageDto } from '../DTOs/chat/CreateMessageDto';
import {Message} from "../models/Message";

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

    this.socket = io('ws://localhost:8000', {
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



  private messagesSubject = new Subject<Message>();
  public messages$ = this.messagesSubject.asObservable();

  private registerSocketListeners(): void {
    this.socket.on('message', (data: Message) => {
      console.log("Event Message : " + JSON.stringify(data));
      this.messagesSubject.next(data);
    });

    this.socket.on('notification', (data: Message) => {
      console.log("Event Notification : " + JSON.stringify(data));
    });


    //TODO: ajouter event notification + des Observables appropriés
  }

}
