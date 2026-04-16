import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePage } from './manage-page';
import { FarmService } from '../services/farm.service';
import type { Animal } from '../models/farm';

describe('ManagePage', () => {
  let component: ManagePage;
  let fixture: ComponentFixture<ManagePage>;
  let farm: {
    getAnimals: () => Animal[];
    upsertTodayLog: (id: number, patch: any) => void;
  };
  let upsertSpy: any;

  beforeEach(async () => {
    upsertSpy = vi.fn();
    const animals: Animal[] = [
      { id: 1, name: 'Vaca', icon: '🐄', count: 2, logs: [] },
      { id: 4, name: 'Gaina', icon: '🐔', count: 10, logs: [] },
      { id: 3, name: 'Porc', icon: '🐖', count: 1, logs: [] },
    ];
    farm = {
      getAnimals: () => animals,
      upsertTodayLog: upsertSpy,
    };

    await TestBed.configureTestingModule({
      imports: [ManagePage],
      providers: [{ provide: FarmService, useValue: farm }],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark invalid inputs with invalidInput map', () => {
    component.markValidity(1, -1);
    expect(component.invalidInput[1]).toBe(true);

    component.markValidity(1, 0);
    expect(component.invalidInput[1]).toBe(false);
  });

  it('should save valid inputs and go back', () => {
    const goBackSpy = vi.fn();
    component.goBack.subscribe(goBackSpy);

    component.todaysInput[1] = 12; // Vaca => milk
    component.todaysInput[4] = 7; // Gaina => eggs
    component.todaysInput[3] = 5; // Porc disabled => ignored
    component.onSaveToday();

    expect(upsertSpy).toHaveBeenCalledWith(1, { milk: 12 });
    expect(upsertSpy).toHaveBeenCalledWith(4, { eggs: 7 });
    // porc skipped
    expect(upsertSpy).not.toHaveBeenCalledWith(3, expect.anything());

    expect(goBackSpy).toHaveBeenCalledTimes(1);
  });
});
