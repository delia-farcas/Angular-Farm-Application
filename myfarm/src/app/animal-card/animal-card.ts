import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Animal } from '../models/animal';

@Component({
  selector: 'app-animal-card, [app-animal-row]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-card.html',
  styleUrls: ['./animal-card.css']
})
export class AnimalCardComponent {

  editIcon = 'edit.svg';
  deleteIcon = 'delete.svg';

  animalImages = [
    'assets/images/vaca-front.png',
    'assets/images/vaca-side.png'
  ];

  @Input() animal!: Animal;

  @Output() edit = new EventEmitter<Animal>();
  @Output() delete = new EventEmitter<number>();

  onEdit() {
    this.edit.emit(this.animal);
  }

  onDelete() {
    this.delete.emit(this.animal.id);
  }
}