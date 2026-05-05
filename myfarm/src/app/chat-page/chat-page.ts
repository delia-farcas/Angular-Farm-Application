import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../models/chat-message';
import { User } from '../models/user';
import { ChatService } from '../services/chat';
import { UserTrackingService } from '../services/user-tracking.service';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-page.html',
  styleUrls: ['./chat-page.css'],
})
export class ChatPage implements OnInit, OnDestroy {
  allUsers: User[] = [];
  messages: ChatMessage[] = [];
  newMessageText = '';
  errorMessage = '';
  isLoadingUsers = false;

  currentUserId = -1;
  selectedUserId: number | null = null;
  selectedUser: User | null = null;

  private messageSub?: Subscription;

  constructor(
    private chatService: ChatService,
    private trackingService: UserTrackingService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.trackingService.getCurrentUserId();
    if (this.currentUserId <= 0) {
      this.errorMessage = 'Nu am gasit utilizatorul curent. Autentifica-te din nou daca vrei sa trimiti mesaje.';
      return; 
    }

    void this.chatService.connect(this.currentUserId);
    this.loadUsers();


    this.messageSub = this.chatService.message$.subscribe((msg) => {
      if (!msg || !this.selectedUserId) return;

      const isRelevant =
        (msg.senderId === this.selectedUserId && msg.receiverId === this.currentUserId) ||
        (msg.senderId === this.currentUserId && msg.receiverId === this.selectedUserId);

      if (isRelevant) {
        this.messages = [...this.messages, msg];
        this.scrollToBottom();
      }
    });
  }

  loadUsers(): void {
  this.isLoadingUsers = true;
  this.chatService.getContacts(this.currentUserId).subscribe({
    next: (users) => {
      this.allUsers = users;
      this.isLoadingUsers = false;
      this.cdr.detectChanges(); // ← add this
    },
    error: () => {
      this.errorMessage = 'Nu s-a putut incarca lista de utilizatori.';
      this.isLoadingUsers = false;
      this.cdr.detectChanges(); 
    },
  });
}

  selectUser(user: User): void {
    this.selectedUser = user;
    this.selectedUserId = user.userId ?? null;
    if (!this.selectedUserId) return;

    this.chatService.getHistory(this.currentUserId, this.selectedUserId).subscribe({
      next: (history) => {
        this.messages = history;
        this.scrollToBottom();
      },
      error: () => {
        this.errorMessage = 'Nu s-a putut incarca istoricul conversatiei.';
      },
    });
  }

  send(): void {
    const content = this.newMessageText.trim();
    if (!content || !this.selectedUserId || this.currentUserId <= 0) return;

    const msg: ChatMessage = {
      senderId: this.currentUserId,
      receiverId: this.selectedUserId,
      content,
      timestamp: new Date(),
    };

    this.chatService.sendMessage(msg);
    this.newMessageText = '';
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const messages = document.querySelector('.messages-history');
      if (messages) messages.scrollTop = messages.scrollHeight;
    }, 100);
  }

  ngOnDestroy(): void {
    this.messageSub?.unsubscribe();
    this.chatService.disconnect();
  }
}
