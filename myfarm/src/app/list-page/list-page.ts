import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../services/animal';
import { Animal } from '../models/animal';
import { AnimalCardComponent } from '../animal-card/animal-card';
import { UserTrackingService } from '../services/user-tracking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AnimalCardComponent],
  templateUrl: './list-page.html',
  styleUrl: './list-page.css',
})
export class ListPage implements OnInit {
  @Output() goToManage = new EventEmitter<void>();
  @Output() goToAddAnimal = new EventEmitter<void>();

  private trackingService = inject(UserTrackingService);
  private animalService = inject(AnimalService);
  private router = inject(Router);

  currentUsername: string = 'Delia';
  animals: Animal[] = [];
  selectedType: 'toate' | 'vaca' | 'porc' | 'gaina' | 'cal' | 'oaie' | 'capra' = 'toate';

  // Parametri pentru paginare
  currentPage = 0;
  pageSize = 15;
  isLoading = false;
  hasMoreData = true; // Ne asigurăm că nu mai cerem date dacă backend-ul e gol

  ngOnInit() {
    this.currentUsername = this.trackingService.getCurrentUser();
    this.loadAnimals(); // Încărcăm prima pagină
  }

  loadAnimals() {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;
    // Folosim un ID de owner simulat (ex: 1)
    this.animalService.getAnimalsPaginated(1, this.currentPage, this.pageSize).subscribe({
      next: (newAnimals) => {
        if (newAnimals.length < this.pageSize) {
          this.hasMoreData = false; // Backend-ul a returnat mai puțin decât am cerut, deci e gata
        }
        this.animals = [...this.animals, ...newAnimals];
        this.currentPage++;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Eroare la încărcarea animalelor', err);
        this.isLoading = false;
      }
    });
  }

  // Detectează scroll-ul în container
  onTableScroll(event: any) {
    const element = event.target;
    // Dacă am ajuns la 90% din fundul containerului, încărcăm pagina următoare
    const threshold = 100; 
    const position = element.scrollHeight - element.scrollTop;
    const offset = element.clientHeight + threshold;

    if (position <= offset && !this.isLoading) {
      this.loadAnimals();
    }
  }

  get filteredAnimals(): Animal[] {
    if (this.selectedType === 'toate') {
      return this.animals;
    }
    return this.animals.filter((a) => a.type === this.selectedType);
  }

  deleteAnimal(id: number) {
    const confirmed = window.confirm('Sigur vrei să ștergi animalul?');
    if (!confirmed) return;

    this.animalService.deleteAnimal(id).subscribe(() => {
      // După ștergere, resetăm lista și reîncărcăm pentru a păstra consistența paginării
      this.animals = [];
      this.currentPage = 0;
      this.hasMoreData = true;
      this.loadAnimals();
    });
  }

  editAnimal(animal: Animal) {
    this.router.navigate(['add'], { state: { animalToEdit: animal } });
  }

  navigatetoAddAnimal(): void {
    this.router.navigate(['add']);
  }

  navigateToManage(): void {
    this.router.navigate(['manage']);
  }
}