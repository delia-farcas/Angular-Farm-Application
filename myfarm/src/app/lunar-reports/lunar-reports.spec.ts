import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LunarReports } from './lunar-reports';
import { FarmService } from '../services/farm.service';
import type { Animal } from '../models/farm';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

describe('LunarReports', () => {
  let component: LunarReports;
  let fixture: ComponentFixture<LunarReports>;

  beforeEach(async () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');

    const animals: Animal[] = [
      {
        id: 1,
        name: 'Vaca',
        icon: '🐄',
        count: 1,
        logs: [
          { date: `${y}-${m}-01`, milk: 10, eggs: 0, wool: 0, workHours: 0 },
          { date: `${y}-${m}-02`, milk: 5, eggs: 2, wool: 0, workHours: 0 },
        ],
      },
    ];

    const farm = {
      getAnimals: () => animals,
      getAnimalById: (id: number) => animals.find(a => a.id === id),
      getLogsInRange: (_id: number, start: string, end: string) =>
        animals[0].logs.filter(l => l.date >= start && l.date <= end),
    };

    await TestBed.configureTestingModule({
      imports: [LunarReports],
      providers: [
        { provide: FarmService, useValue: farm },
        provideCharts(withDefaultRegisterables()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LunarReports);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change totals when category changes', () => {
    component.selectedAnimalId = 1;

    component.category = 'lapte';
    const milkTotal = component.total;

    component.category = 'oua';
    const eggsTotal = component.total;

    expect(milkTotal).toBeGreaterThan(0);
    expect(eggsTotal).toBeGreaterThanOrEqual(0);
    expect(milkTotal).not.toBe(eggsTotal);
  });
});
