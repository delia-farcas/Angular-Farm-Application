import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalService } from '../services/animal';
import { Animal } from '../models/animal';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { UserTrackingService } from '../services/user-tracking.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-animal',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  iconMapping: Record<string, string> = {
    'vaca': '/animals/cow.svg',
    'cal': '/animals/horse.svg',
    'gaina': '/animals/chick.svg',
    'porc': '/animals/pig.svg',
    'oaie': '/animals/sheep.svg',
    'capra': '/animals/goat.svg'
  };

  reverseIconMapping: Record<string, string> = {
    '/animals/cow.svg': 'vaca',
    '/animals/horse.svg': 'cal',
    '/animals/chick.svg': 'gaina',
    '/animals/pig.svg': 'porc',
    '/animals/sheep.svg': 'oaie',
    '/animals/goat.svg': 'capra'
  };

  private trackingService = inject(UserTrackingService);

  animal: Animal = {
    id: 0,
    name: '',
    status: 'Sanatoasa',
    type: 'vaca',
    sex: 'femela',
    age: 0,
    location: '',
    observations: ''
  };

  constructor(private animalService: AnimalService, private router: Router) {
  // Extragem datele din router STATE aici!
  const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras.state && navigation.extras.state['animalToEdit']) {
    this.animalToEdit = navigation.extras.state['animalToEdit'];
  }
}

ngOnInit(): void {
  // Acum animalToEdit are valoare (dacă a fost trimisă)
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
      console.log('Date încărcate în formular:', this.animal);
    }
  }

  shouldShowError(
    control: { invalid: boolean | null; touched: boolean | null; dirty: boolean | null } | null | undefined
  ): boolean {
    return !!control && !!control.invalid && (!!control.touched || !!control.dirty || this.formSubmitted);
  }

  onSubmit(form: NgForm) {
    this.formSubmitted = true;

    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    const trimmed: Animal = {
      ...this.animal,
      name: this.animal.name.trim(),
      location: this.animal.location.trim(),
    };

    if (this.isEditMode && trimmed.id) {
      this.animalService.updateAnimal(trimmed);
      this.trackingService.logActivity('edit_animal');
      this.trackingService.incrementCounter('animals_edited');
      window.alert('Animal editat cu succes!');
    } else {
      const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
      this.animalService.addAnimal({ ...trimmed, id: uniqueId });
      this.trackingService.logActivity('add_animal');
      this.trackingService.incrementCounter('animals_added');
      window.alert('Animal adăugat cu succes!');
    }

    this.router.navigate(['home']);
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

  private resetForm(): void {
    this.formSubmitted = false;
    this.animal = {
      id: 0,
      name: '',
      type: 'vaca',
      sex: 'femela',
      age: 0,
      status: 'Sanatoasa',
      location: '',
      observations: '',
    };
  }

  navigateToBazinga(): void {
    this.router.navigate(['bazinga']);
  }

  navigateToRaports(): void {
    this.router.navigate(['raports']);
  }
}