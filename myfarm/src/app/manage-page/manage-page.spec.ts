import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePage } from './manage-page';
import { FarmService } from '../services/farm.service';
import type { Animal } from '../models/farm';
import { of } from 'rxjs';
import { UserTrackingService } from '../services/user-tracking.service';

describe('ManagePage', () => {
  let component: ManagePage;
  let fixture: ComponentFixture<ManagePage>;
  let farm: {
    getAnimals: () => Animal[];
    upsertDailyLog: (payload: any) => any;
  };
  let upsertSpy: any;

  beforeEach(async () => {
    vi.useFakeTimers();
    upsertSpy = vi.fn();
    const animals: Animal[] = [
      { id: 1, name: 'Vaca', icon: '/animals/cow.svg', count: 2, logs: [] },
      { id: 4, name: 'Gaina', icon: '/animals/chick.svg', count: 10, logs: [] },
      { id: 3, name: 'Porc', icon: '/animals/pig.svg', count: 1, logs: [] },
    ];
    farm = {
      getAnimals: () => animals,
      upsertDailyLog: upsertSpy,
    };

    await TestBed.configureTestingModule({
      imports: [ManagePage],
      providers: [
        { provide: FarmService, useValue: farm },
        {
          provide: UserTrackingService,
          useValue: { getCurrentUser: () => 'Test', getCurrentUserId: () => 1 },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
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

    upsertSpy.mockReturnValue(of({}));

    component.todaysInput[1] = 12;
    component.todaysInput[4] = 7;
    component.todaysInput[3] = 5;
    component.onSaveToday();

    expect(upsertSpy).toHaveBeenCalledTimes(1);
    expect(upsertSpy).toHaveBeenCalledWith({
      milkLitersCow: 12,
      milkLitersGoat: 0,
      milkLitersSheep: 0,
      eggsCount: 7,
      woolKg: 0,
      meatKg: 5,
      workHours: 0,
    });

    vi.runAllTimers();
    expect(goBackSpy).toHaveBeenCalledTimes(1);
  });
});
