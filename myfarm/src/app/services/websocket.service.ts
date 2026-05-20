import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Animal } from '../models/animal';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client;
  private animalSubject = new Subject<Animal>();

  /** Instantiates the component and injects dependencies. */
  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('https://192.168.101.24:8080/ws-farm'),
      debug: (str) => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket: ' + frame);
      this.stompClient.subscribe('/topic/animals', (message) => {
        if (message.body) {
          const newAnimal: Animal = JSON.parse(message.body);
          this.animalSubject.next(newAnimal);
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.stompClient.activate();
  }

  /** Retrieves the new animals. */
  getNewAnimals(): Observable<Animal> {
    return this.animalSubject.asObservable();
  }
}
