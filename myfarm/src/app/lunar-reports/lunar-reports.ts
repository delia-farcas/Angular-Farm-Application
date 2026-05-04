import {
  Component,
  inject,
  OnInit,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { FarmService } from '../services/farm.service';
import { Animal, DailyLogEntry, FarmProductCategory } from '../models/farm';
import { UserTrackingService } from '../services/user-tracking.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lunar-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './lunar-reports.html',
  styleUrl: './lunar-reports.css',
})
export class LunarReports implements OnInit, OnDestroy {
  view: 'table' | 'chart' = 'table';
  category: FarmProductCategory = 'lapte';
  selectedAnimalId: number;

  private readonly now = new Date();
  private readonly year = this.now.getFullYear();
  private readonly monthIndex = this.now.getMonth();

  currentLogs: DailyLogEntry[] = [];
  processedRows: { label: string; total: number }[] = [];
  total = 0;

  private logSubscription?: Subscription;
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
    this.loadPreferences();
    this.refreshData(); // Inițiem prima încărcare a datelor
  }

  /** Handles the Ng on destroy functionality. */
  ngOnDestroy(): void {
    this.logSubscription?.unsubscribe();
  }

  /** Handles the Load preferences functionality. */
  private loadPreferences(): void {
    const savedView = this.trackingService.getPreference('preferred_view');
    if (savedView === 'chart' || savedView === 'table') this.view = savedView;

    const savedCat = this.trackingService.getPreference('last_category') as FarmProductCategory;
    if (savedCat) this.category = savedCat;

    this.trackingService.logActivity('viewed_lunar_reports');
  }

  /** Handles the Refresh data functionality. */
  refreshData(): void {
    const startIso = this.monthStartIso();
    const endIso = this.monthEndIso();

    this.logSubscription?.unsubscribe();
    this.logSubscription = this.farm
      .getLogsInRange(this.trackingService.getCurrentUserId(), startIso, endIso)
      .subscribe({
        next: (logs) => {
          this.currentLogs = logs;
          this.processLogsIntoTable();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Eroare la încărcarea rapoartelor:', err),
      });
  }

  /** Handles the Process logs into table functionality. */
  private processLogsIntoTable(): void {
    const endDay = new Date(this.year, this.monthIndex + 1, 0).getDate();
    const buckets = [
      { from: 1, to: Math.min(7, endDay) },
      { from: 8, to: Math.min(14, endDay) },
      { from: 15, to: Math.min(21, endDay) },
      { from: 22, to: endDay },
    ].filter((b) => b.from <= b.to);

    const pad = (n: number) => String(n).padStart(2, '0');
    const monthStr = pad(this.monthIndex + 1);

    this.processedRows = buckets.map((b) => {
      const fromIso = `${this.year}-${monthStr}-${pad(b.from)}`;
      const toIso = `${this.year}-${monthStr}-${pad(b.to)}`;
      const total = this.currentLogs
        .filter((l) => l.date >= fromIso && l.date <= toIso)
        .reduce((sum, l) => sum + this.getValueForCategory(l), 0);
      return { label: `${b.from}-${b.to}`, total };
    });

    this.total = this.processedRows.reduce((s, r) => s + r.total, 0);

    if (this.charts) {
      this.charts.forEach((c) => c.update());
    }
  }

  get selectedAnimal(): Animal | undefined {
    return this.farm.getAnimalById(this.selectedAnimalId);
  }

  get animals(): Animal[] {
    return this.farm.getAnimals();
  }

  get tableRows(): { label: string; total: number }[] {
    return this.processedRows;
  }

  /** Retrieves the value for category. */
  private getValueForCategory(entry: DailyLogEntry): number {
    const mapping: any = {
      lapte: 'milk',
      oua: 'eggs',
      lana: 'wool',
      ore_munca: 'workHours',
      carne: 'meat',
    };
    return (entry as any)[mapping[this.category]] || 0;
  }

  /** Handles the Month start iso functionality. */
  private monthStartIso(): string {
    return `${this.year}-${String(this.monthIndex + 1).padStart(2, '0')}-01`;
  }

  /** Handles the Month end iso functionality. */
  private monthEndIso(): string {
    const d = new Date(this.year, this.monthIndex + 1, 0);
    return `${this.year}-${String(this.monthIndex + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  get unit(): string {
    const units: any = { lapte: 'L', oua: 'ouă', lana: 'kg', ore_munca: 'ore', carne: 'kg' };
    return units[this.category] || '';
  }

  /** Handles the toggle view event. */
  onToggleView(event: any): void {
    this.view = event.target?.checked ? 'chart' : 'table';
    this.trackingService.setPreference('preferred_view', this.view);
  }

  /** Handles the category change event. */
  onCategoryChange(newCategory: FarmProductCategory): void {
    this.category = newCategory;
    this.trackingService.setPreference('last_category', newCategory);
    this.processLogsIntoTable(); // Recalculăm vizualizarea fără a reîncărca de pe server
  }

  /** Handles the Toggle generator functionality. */
  toggleGenerator(event: any): void {
    const isGenerating = event.target.checked;
    if (isGenerating) {
      this.farm.startServerGenerator().subscribe();
    } else {
      this.farm.stopServerGenerator().subscribe();
    }
  }

  get chartData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.processedRows.map((r) => r.label),
      datasets: [
        {
          data: this.processedRows.map((r) => r.total),
          label: `${this.category} (Unitate: ${this.unit})`,
          borderColor: '#388333',
          tension: 0.35,
          fill: false,
        },
      ],
    };
  }

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
  };
}
