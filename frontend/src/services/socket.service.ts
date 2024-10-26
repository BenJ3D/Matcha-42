// src/app/services/socket.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../models/user.model'; // Assurez-vous d'avoir un modèle User approprié

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private socket!: Socket;
  private socketConnected$ = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.socketConnected$.asObservable();

  constructor(private authService: AuthService) {
    // Écoutez les changements d'authentification pour établir ou fermer la connexion
    this.authService.user$.subscribe((user) => {
      if (user && user.is_verified) {
        this.connectSocket(user.accessToken);
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
      console.log('Connected to Socket.IO server');
      this.socketConnected$.next(true);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from Socket.IO server:', reason);
      this.socketConnected$.next(false);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Connection error:', error);
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
}
