import {
  Component,
  inject,
  OnInit,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { FarmService } from '../services/farm.service';
import { Animal, FarmProductCategory } from '../models/farm';
import { UserTrackingService } from '../services/user-tracking.service';

@Component({
  selector: 'app-lunar-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './lunar-reports.html',
  styleUrl: './lunar-reports.css',
})
export class LunarReports implements OnInit {
  view: 'table' | 'chart' = 'table';
  category: FarmProductCategory = 'lapte';
  selectedAnimalId: number;

  private readonly now = new Date();
  private readonly year = this.now.getFullYear();
  private readonly monthIndex = this.now.getMonth();
  private generatorId: any;

  private trackingService = inject(UserTrackingService);

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  /** Instantiates the component and injects dependencies. */
  constructor(
    private farm: FarmService,
    private cdr: ChangeDetectorRef,
  ) {
    this.selectedAnimalId = this.farm.getAnimals()[0]?.id ?? 1;
  }

  /** Initializes the component. */
  ngOnInit(): void {
    const savedView = this.trackingService.getPreference('preferred_view');
    if (savedView === 'chart' || savedView === 'table') {
      this.view = savedView;
    }

    const savedCat = this.trackingService.getPreference('last_category') as FarmProductCategory;
    if (savedCat) {
      this.category = savedCat;
    }

    this.trackingService.logActivity('viewed_lunar_reports');
  }

  get animals(): Animal[] {
    return this.farm.getAnimals();
  }

  get selectedAnimal(): Animal | undefined {
    return this.farm.getAnimalById(this.selectedAnimalId);
  }

  /** Retrieves the value for category. */
  private getValueForCategory(entry: any): number {
    switch (this.category) {
      case 'lapte':
        return entry.milk;
      case 'oua':
        return entry.eggs;
      case 'lana':
        return entry.wool;
      case 'ore_munca':
        return entry.workHours;
      case 'carne':
        return entry.meat;
      default:
        return 0;
    }
  }

  /** Handles the Month start iso functionality. */
  private monthStartIso(): string {
    const d = new Date(this.year, this.monthIndex, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  /** Handles the Month end iso functionality. */
  private monthEndIso(): string {
    const d = new Date(this.year, this.monthIndex + 1, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  get tableRows(): { label: string; total: number }[] {
    const startIso = this.monthStartIso();
    const endIso = this.monthEndIso();
    const logs = this.farm.getLogsInRange(this.selectedAnimalId, startIso, endIso);
    const endDay = new Date(this.year, this.monthIndex + 1, 0).getDate();

    const buckets = [
      { from: 1, to: Math.min(7, endDay) },
      { from: 8, to: Math.min(14, endDay) },
      { from: 15, to: Math.min(21, endDay) },
      { from: 22, to: endDay },
    ].filter((b) => b.from <= b.to);

    const pad = (n: number) => String(n).padStart(2, '0');
    const monthStr = pad(this.monthIndex + 1);

    return buckets.map((b) => {
      const fromIso = `${this.year}-${monthStr}-${pad(b.from)}`;
      const toIso = `${this.year}-${monthStr}-${pad(b.to)}`;
      const total = logs
        .filter((l) => l.date >= fromIso && l.date <= toIso)
        .reduce((sum, l) => sum + this.getValueForCategory(l), 0);
      return { label: `${b.from}-${b.to}`, total };
    });
  }

  get total(): number {
    return this.tableRows.reduce((s, r) => s + r.total, 0);
  }

  get unit(): string {
    const units: any = { lapte: 'L', oua: 'ouă', lana: 'kg', ore_munca: 'ore', carne: 'kg' };
    return units[this.category] || '';
  }

  get chartData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.tableRows.map((r) => r.label),
      datasets: [
        {
          data: this.tableRows.map((r) => r.total),
          label: `${this.selectedAnimal?.name ?? 'Animal'} • ${this.category}`,
          tension: 0.35,
          fill: false,

          borderColor: '#388333', // Culoarea liniei
          pointBackgroundColor: '#388333', // Culoarea punctelor
          pointBorderColor: '#fff', // Conturul punctelor (le face mai vizibile)
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#388333',
        },
      ],
    };
  }

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } },
  };

  /** Handles the toggle view event. */
  onToggleView(event: any): void {
    const isChecked = event.target?.checked;
    this.view = isChecked ? 'chart' : 'table';
    this.trackingService.setPreference('preferred_view', this.view);
    this.trackingService.logActivity(`switched_view_to_${this.view}`);
  }

  /** Handles the category change event. */
  onCategoryChange(newCategory: FarmProductCategory): void {
    this.category = newCategory;
    this.trackingService.setPreference('last_category', newCategory);
    this.trackingService.logActivity(`changed_category_to_${newCategory}`);
  }

  /** Handles the Toggle generator functionality. */
  toggleGenerator(event: any) {
    const isGenerating = event.target.checked;
    if (isGenerating) {
      this.generatorId = setInterval(() => {
        this.updateCharts();
      }, 500);
    } else {
      this.stopGenerator();
    }
  }

  /** Handles the Stop generator functionality. */
  stopGenerator() {
    if (this.generatorId) {
      clearInterval(this.generatorId);
    }
  }

  /** Handles the Update charts functionality. */
  updateCharts(): void {
    const animal = this.selectedAnimal;
    if (!animal) return;

    const d = Math.floor(Math.random() * 28) + 1;
    const dateStr = `${this.year}-${String(this.monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    let existing = animal.logs.find((l) => l.date === dateStr);
    if (!existing) {
      existing = { date: dateStr, milk: 0, eggs: 0, wool: 0, workHours: 0, meat: 0 };
      animal.logs.push(existing);
    }

    const randomAdd = Math.floor(Math.random() * 20) + 1;
    switch (this.category) {
      case 'lapte':
        existing.milk += randomAdd;
        break;
      case 'oua':
        existing.eggs += randomAdd;
        break;
      case 'lana':
        existing.wool += randomAdd;
        break;
      case 'ore_munca':
        existing.workHours += randomAdd;
        break;
      case 'carne':
        existing.meat += randomAdd;
        break;
    }

    this.cdr.detectChanges();
    if (this.charts) {
      this.charts.forEach((chart) => chart.update());
    }
  }
}
