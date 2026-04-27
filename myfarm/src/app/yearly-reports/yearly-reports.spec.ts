import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyReports } from './yearly-reports';
import { FarmService } from '../services/farm.service';
import type { Animal } from '../models/farm';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

describe('YearlyReports', () => {
  let component: YearlyReports;
  let fixture: ComponentFixture<YearlyReports>;

  beforeEach(async () => {
    const year = new Date().getFullYear();
    const animals: Animal[] = [
      {
        id: 1,
        name: 'Vaca',
        icon: '/animals/cow.svg',
        count: 1,
        logs: [
          { date: `${year}-01-10`, milk: 10, eggs: 0, wool: 0, workHours: 0, meat: 0 },
          { date: `${year}-02-10`, milk: 0, eggs: 4, wool: 0, workHours: 0, meat: 0 },
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
      imports: [YearlyReports],
      providers: [
        { provide: FarmService, useValue: farm },
        provideCharts(withDefaultRegisterables()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(YearlyReports);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should aggregate by months for selected category', () => {
    component.selectedAnimalId = 1;

    component.category = 'lapte';
    const milkTotals = component.tableRows.map(r => r.total);
    expect(milkTotals.some(v => v > 0)).toBe(true);

    component.category = 'oua';
    const eggTotals = component.tableRows.map(r => r.total);
    expect(eggTotals.some(v => v > 0)).toBe(true);
  });
});
