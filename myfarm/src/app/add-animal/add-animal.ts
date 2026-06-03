import {
  Component,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalService } from '../services/animal';
import { Animal } from '../models/animal';
import { FormsModule, NgForm } from '@angular/forms';
import { UserTrackingService } from '../services/user-tracking.service';
import { Router } from '@angular/router';
import { UserOptions } from '../user-options/user-options';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-animal',
  standalone: true,
  imports: [CommonModule, FormsModule, UserOptions],
  templateUrl: './add-animal.html',
  styleUrl: './add-animal.css',
})
export class AddAnimal implements OnChanges, OnInit {
  @Output() goBack = new EventEmitter<void>();
  @Input() animalToEdit: Animal | null = null;

  selectedIcon = '/animals/cow.svg';
  isPickerVisible = false;
  isEditMode = false;
  formSubmitted = false;
  isMenuOpen = false;

  iconMapping: Record<string, string> = {
    vaca: '/animals/cow.svg',
    cal: '/animals/horse.svg',
    gaina: '/animals/chick.svg',
    porc: '/animals/pig.svg',
    oaie: '/animals/sheep.svg',
    capra: '/animals/goat.svg',
  };

  reverseIconMapping: Record<string, string> = {
    '/animals/cow.svg': 'vaca',
    '/animals/horse.svg': 'cal',
    '/animals/chick.svg': 'gaina',
    '/animals/pig.svg': 'porc',
    '/animals/sheep.svg': 'oaie',
    '/animals/goat.svg': 'capra',
  };

  private trackingService = inject(UserTrackingService);

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  isAdmin(): boolean {
    return this.trackingService.isCurrentUserAdmin();
  }

  animal: Animal = {
    id: 0,
    name: '',
    status: 'Sanatoasa',
    type: 'vaca',
    sex: 'femela',
    age: 0,
    location: '',
    observations: '',
    userId: this.trackingService.getCurrentUserId(),
  };

  constructor(
    private animalService: AnimalService,
    private router: Router,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['animalToEdit']) {
      this.animalToEdit = navigation.extras.state['animalToEdit'];
    }
  }

  ngOnInit(): void {
    if (this.animalToEdit) {
      this.setupEditMode();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animalToEdit'] && this.animalToEdit) {
      this.setupEditMode();
    }
  }

  private setupEditMode(): void {
    if (this.animalToEdit) {
      this.isEditMode = true;
      this.animal = { ...this.animalToEdit };
      if (this.iconMapping[this.animal.type]) {
        this.selectedIcon = this.iconMapping[this.animal.type];
      }
    }
  }

  shouldShowError(
    control:
      | { invalid: boolean | null; touched: boolean | null; dirty: boolean | null }
      | null
      | undefined,
  ): boolean {
    return (
      !!control && !!control.invalid && (!!control.touched || !!control.dirty || this.formSubmitted)
    );
  }

  async onSubmit(form: NgForm): Promise<void> {
    this.formSubmitted = true;

    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    const trimmed: Animal = {
      ...this.animal,
      name: this.animal.name.trim(),
      location: this.animal.location.trim(),
      userId: this.trackingService.getCurrentUserId(),
    };

    try {
      if (this.isEditMode && trimmed.id) {
        await firstValueFrom(this.animalService.updateAnimal(trimmed));
        this.trackingService.logActivity('edit_animal');
        this.trackingService.incrementCounter('animals_edited');
        window.alert('Animal editat cu succes!');
      } else {
        await firstValueFrom(this.animalService.addAnimal(trimmed));
        this.trackingService.logActivity('add_animal');
        this.trackingService.incrementCounter('animals_added');
        window.alert('Animal adăugat cu succes!');
      }
      await this.router.navigate(['home']);
    } catch (err) {
      console.error(this.isEditMode ? 'Eroare la editare:' : 'Eroare la adăugare:', err);
    }
  }

  onBackClick(): void {
    this.router.navigate(['home']);
  }

  togglePicker(event: Event) {
    event.preventDefault();
    this.isPickerVisible = !this.isPickerVisible;
  }

  onTypeChange(newType: string) {
    if (this.iconMapping[newType]) {
      this.selectedIcon = this.iconMapping[newType];
    }
  }

  selectIcon(icon: string) {
    this.selectedIcon = icon;
    this.animal.type = this.reverseIconMapping[icon] as Animal['type'];
    this.isPickerVisible = false;
  }

  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }

  navigateToUsers(): void {
    this.router.navigate(['users']);
  }

  navigateHome(): void {
    this.router.navigate(['home']);
  }

  navigateToActivity(): void {
    this.router.navigate(['activity']);
  }
}
