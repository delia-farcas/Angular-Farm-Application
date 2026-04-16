import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Animal } from '../models/animal';

@Component({
  selector: 'app-animal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-card.html',
  styleUrls: ['./animal-card.css']
})
export class AnimalCardComponent {

  @Input() animal!: Animal;

  @Input() animalImages: string[] = [];

  @Input() editIcon: string = '';
  @Input() deleteIcon: string = '';

  @Output() edit = new EventEmitter<Animal>();
  @Output() delete = new EventEmitter<number>();

  onEdit() {
    this.edit.emit(this.animal);
  }

  onDelete() {
    this.delete.emit(this.animal.id);
  }
}