import { Component, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { FarmService } from '../services/farm.service';
import { Animal, FarmProductCategory, DailyLogEntry } from '../models/farm';
import { UserTrackingService } from '../services/user-tracking.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-yearly-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './yearly-reports.html',
  styleUrl: './yearly-reports.css',
})
export class YearlyReports {
  view: 'table' | 'chart' = 'table';
  category: FarmProductCategory = 'lapte';
  selectedAnimalId: number;

  private readonly year = new Date().getFullYear();
  private isGenerating = false;
  private generatorId: any;

  currentLogs: DailyLogEntry[] = [];
  processedRows: { label: string; total: number }[] = [];
  grandTotal = 0;

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
  ngOnInit() {
    this.refreshData();
  }

  get animals(): Animal[] {
    return this.farm.getAnimals();
  }

  get selectedAnimal(): Animal | undefined {
    return this.farm.getAnimalById(this.selectedAnimalId);
  }

  /** Handles the Refresh data functionality. */
  refreshData(): void {
    const start = `${this.year}-01-01`;
    const end = `${this.year}-12-31`;
    this.farm.getLogsInRange(this.trackingService.getCurrentUserId(), start, end).subscribe((logs) => {
      this.currentLogs = logs || [];
      this.processLogsIntoTable();
      this.cdr.detectChanges();
    });
  }

  /** Handles the Process logs into table functionality. */
  private processLogsIntoTable(): void {
    const months = [
      'Ianuarie',
      'Februarie',
      'Martie',
      'Aprilie',
      'Mai',
      'Iunie',
      'Iulie',
      'August',
      'Septembrie',
      'Octombrie',
      'Noiembrie',
      'Decembrie',
    ];

    this.processedRows = months.map((label, idx) => {
      const startIso = `${this.year}-${this.pad2(idx + 1)}-01`;
      const endDate = new Date(this.year, idx + 1, 0).getDate();
      const endIso = `${this.year}-${this.pad2(idx + 1)}-${this.pad2(endDate)}`;

      const total = this.currentLogs
        .filter((l) => l.date >= startIso && l.date <= endIso)
        .reduce((sum, l) => sum + this.getValueForCategory(l), 0);
      return { label, total };
    });

    this.grandTotal = this.processedRows.reduce((s, r) => s + r.total, 0);

    if (this.charts) {
      this.charts.forEach((c) => c.update());
    }
  }

  /** Retrieves the value for category. */
  private getValueForCategory(entry: DailyLogEntry): number {
    switch (this.category) {
      case 'lapte':
        return entry.milk || 0;
      case 'oua':
        return entry.eggs || 0;
      case 'lana':
        return entry.wool || 0;
      case 'ore_munca':
        return entry.workHours || 0;
      case 'carne':
        return entry.meat || 0;
    }
  }

  /** Handles the Pad2 functionality. */
  private pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  get tableRows(): { label: string; total: number }[] {
    return this.processedRows;
  }

  get total(): number {
    return this.grandTotal;
  }

  get unit(): string {
    switch (this.category) {
      case 'lapte':
        return 'L';
      case 'oua':
        return 'ouă';
      case 'lana':
        return 'kg';
      case 'ore_munca':
        return 'ore';
      case 'carne':
        return 'kg';
    }
  }

  get chartData(): ChartConfiguration<'line'>['data'] {
    const labels = this.processedRows.map((r) => r.label);
    const data = this.processedRows.map((r) => r.total);

    return {
      labels,
      datasets: [
        {
          data,
          label: `${this.selectedAnimal?.name ?? 'Animal'} • ${this.category}`,
          tension: 0.35,
          fill: false,
          borderColor: '#388333',
          pointBackgroundColor: '#388333',
          pointBorderColor: '#fff',
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
  }

  /** Handles the Toggle generator functionality. */
  toggleGenerator(event: any) {
    this.isGenerating = event.target.checked;
    if (this.isGenerating) {
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

    const m = Math.floor(Math.random() * 12) + 1;
    const d = Math.floor(Math.random() * 28) + 1;
    const dateStr = `${this.year}-${this.pad2(m)}-${this.pad2(d)}`;

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
