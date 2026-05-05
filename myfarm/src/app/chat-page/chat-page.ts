import { Component } from '@angular/core';
import {UserOptions} from '../user-options/user-options';
@Component({
  selector: 'app-chat-page',
  imports: [UserOptions],
  templateUrl: './chat-page.html',
  styleUrl: './chat-page.css',
})
export class ChatPage {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
