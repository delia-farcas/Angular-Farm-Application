import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Animal } from '../models/animal';

@Component({
  selector: 'app-animal-card, [app-animal-row]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-card.html',
  styleUrls: ['./animal-card.css'],
})
export class AnimalCardComponent {
  @Input() display: 'card' | 'row' = 'card';
  @Input() editIcon = 'edit.svg';
  @Input() deleteIcon = 'delete.svg';

  @Input() animalImages = ['assets/images/vaca-front.png', 'assets/images/vaca-side.png'];

  @Input() animal!: Animal;

  @Output() edit = new EventEmitter<Animal>();
  @Output() delete = new EventEmitter<number>();

  /** Handles the edit event. */
  onEdit() {
    this.edit.emit(this.animal);
  }

  /** Handles the delete event. */
  onDelete() {
    this.delete.emit(this.animal.id);
  }

  /** Retrieves the icon path. */
  getIconPath(type: string): string {
    const mapping: Record<string, string> = {
      vaca: '/animals/cow.svg',
      cal: '/animals/horse.svg',
      gaina: '/animals/chick.svg',
      porc: '/animals/pig.svg',
      oaie: '/animals/sheep.svg',
      capra: '/animals/goat.svg',
    };
    return mapping[type] || '/animals/cow.svg';
  }
}
