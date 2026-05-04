import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { UserListRow } from '../models/user-list-row';

@Component({
  selector: 'app-user-card, [app-user-row]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCardComponent {
  @Input() display: 'card' | 'row' = 'row';
  @Input() deleteIcon = 'delete.svg';

  @Input({ required: true }) userRow!: UserListRow;

  @Output() delete = new EventEmitter<number>();

  onDelete(): void {
    this.delete.emit(this.userRow.userId);
  }
}
