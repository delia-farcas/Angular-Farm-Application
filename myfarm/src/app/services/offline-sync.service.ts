import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body: any;
  headers: any;
}

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  private http = inject(HttpClient);
  private queueKey = 'offline_queue';

  /** Instantiates the component and injects dependencies. */
  constructor() {
    window.addEventListener('online', () => this.sync());
  }

  /** Handles the Add to queue functionality. */
  addToQueue(req: any) {
    const queue = this.getQueue();
    queue.push({
      id: Math.random().toString(36).substring(2, 9),
      url: req.url,
      method: req.method,
      body: req.body,
      headers: req.headers, // Adaugă această linie
    });
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  /** Retrieves the queue. */
  private getQueue(): QueuedRequest[] {
    const data = localStorage.getItem(this.queueKey);
    return data ? JSON.parse(data) : [];
  }

  /** Handles the Sync functionality. */
  sync() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log('Sincronizare offline... Procesare', queue.length, 'cereri.');

    queue.forEach((req, index) => {
      this.http.request(req.method, req.url, { body: req.body }).subscribe({
        next: () => {
          console.log(`Cererea ${index} sincronizată cu succes.`);
          this.removeFromQueue(req.id);
        },
        error: (err) => console.error(`Eroare la sincronizarea cererii ${index}:`, err),
      });
    });
  }

  /** Handles the Remove from queue functionality. */
  private removeFromQueue(idToRemove: string) {
    let queue = this.getQueue();
    queue = queue.filter(req => req.id !== idToRemove);
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }
}
