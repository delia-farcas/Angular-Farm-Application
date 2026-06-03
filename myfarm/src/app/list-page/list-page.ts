import {
  Component,
  EventEmitter,
  Output,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnimalService } from '../services/animal';
import { Animal } from '../models/animal';
import { AnimalCardComponent } from '../animal-card/animal-card';
import { UserTrackingService } from '../services/user-tracking.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private cdr = inject(ChangeDetectorRef);

  currentUsername: string = 'Delia';
  animals: Animal[] = [];
  selectedType: 'toate' | 'vaca' | 'porc' | 'gaina' | 'cal' | 'oaie' | 'capra' = 'toate';

  currentPage = 0;
  pageSize = 15;
  isLoading = false;
  hasMoreData = true;

  ngOnInit() {
    this.currentUsername = this.trackingService.getCurrentUser();
    this.loadAnimals();
  }

  async loadAnimals(): Promise<void> {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const newAnimals = await firstValueFrom(
        this.animalService.getAnimalsPaginated(
          this.trackingService.getCurrentUserId(),
          this.currentPage,
          this.pageSize,
        ),
      );

      if (newAnimals.length < this.pageSize) {
        this.hasMoreData = false;
      }
      this.animals = [...this.animals, ...newAnimals];
      this.currentPage++;
    } catch (err) {
      console.error('Eroare la încărcarea animalelor', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onTableScroll(event: any) {
    const element = event.target;

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

  async deleteAnimal(id: number): Promise<void> {
    const confirmed = window.confirm('Sigur vrei să ștergi animalul?');
    if (!confirmed) return;

    try {
      await firstValueFrom(this.animalService.deleteAnimal(id));
      this.animals = [];
      this.currentPage = 0;
      this.hasMoreData = true;
      await this.loadAnimals();
    } catch (err) {
      console.error('Eroare la ștergerea animalului', err);
    }
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
