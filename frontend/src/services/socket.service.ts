import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { UserResponseDto } from '../DTOs/users/UserResponseDto';
import { MessageDto } from "../DTOs/chat/MessageDto";
import { environment } from "../environment/environment";

@Injectable({
  providedIn: 'root',
})
export class SocketService implements OnDestroy {
  private socket!: Socket;
  private socketConnected$ = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.socketConnected$.asObservable();

  constructor(private authService: AuthService) {
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

    const apiURL = environment.apiURL;
    const parsedURL = new URL(apiURL);

    parsedURL.protocol = parsedURL.protocol === 'https:' ? 'wss:' : 'ws:';
    parsedURL.pathname = parsedURL.pathname.replace(/\/api$/, '');

    this.socket = io(parsedURL.toString(), {
      transports: ['websocket'],
      auth: {
        token: token,
      },
    });

    this.socket.on('connect', () => {
      this.socketConnected$.next(true);
      this.registerSocketListeners();
    });

    this.socket.on('disconnect', () => {
      this.socketConnected$.next(false);
    });

    this.socket.on('connect_error', (error: any) => {
      this.socketConnected$.next(false);
    });

  }

  private disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socketConnected$.next(false);
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  on<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (this.socket) {
        this.socket.on(event, (data: T) => {
          subscriber.next(data);
        });
      }

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
  }

}