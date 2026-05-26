import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { ChatMessage } from '../models/chat-message';
import { User } from '../models/user';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private stompClient?: Client;
  private messageSource = new BehaviorSubject<ChatMessage | null>(null);

  message$ = this.messageSource.asObservable();

  private readonly apiUrl = `${environment.apiUrl}/api/chat`;
  private readonly websocketUrl = `${environment.apiUrl}/ws-chat`;

  constructor(private http: HttpClient) {}

  async connect(userId: number): Promise<void> {
    this.disconnect();

    const browserGlobal = globalThis as typeof globalThis & { global?: typeof globalThis };
    browserGlobal.global ??= globalThis;
    const { default: SockJS } = await import('sockjs-client');

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.websocketUrl),
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        this.stompClient?.subscribe(`/topic/chat/${userId}`, (message: IMessage) => {
          if (!message.body) return;

          this.messageSource.next(JSON.parse(message.body) as ChatMessage);
        });
      },
      onStompError: (frame) => {
        console.error('Eroare STOMP:', frame.headers['message'], frame.body);
      },
    });

    this.stompClient.activate();
  }

  sendMessage(chatMessage: ChatMessage): void {
    if (!this.stompClient?.connected) {
      console.error('Nu se poate trimite mesajul. Conexiunea nu este stabilita.');
      return;
    }

    this.stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage),
    });
  }

  getHistory(user1: number, user2: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history`, {
      params: {
        user1,
        user2,
      },
    });
  }

  getContacts(requesterId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/contacts`, {
      params: {
        requesterId,
      },
    });
  }

  disconnect(): void {
    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }
  }
}
