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
  isAnimalSelectOpen = false;

  private readonly now = new Date();
  private readonly year = this.now.getFullYear();
  private readonly monthIndex = this.now.getMonth();

  currentLogs: DailyLogEntry[] = [];
  processedRows: { label: string; total: number }[] = [];
  total = 0;

  private logSubscription?: Subscription;
  private trackingService = inject(UserTrackingService);

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  constructor(
    private farm: FarmService,
    private cdr: ChangeDetectorRef,
  ) {
    this.selectedAnimalId = this.farm.getAnimals()[0]?.id ?? 1;
  }

  ngOnInit(): void {
    this.loadPreferences();
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.logSubscription?.unsubscribe();
  }

  private loadPreferences(): void {
    const savedView = this.trackingService.getPreference('preferred_view');
    if (savedView === 'chart' || savedView === 'table') this.view = savedView;

    const savedCat = this.trackingService.getPreference('last_category') as FarmProductCategory;
    if (savedCat) this.category = savedCat;

    this.trackingService.logActivity('viewed_lunar_reports');
  }

  refreshData(): void {
    const startIso = this.monthStartIso();
    const endIso = this.monthEndIso();

    this.logSubscription?.unsubscribe();
    this.logSubscription = this.farm
      .getLogsInRange(this.trackingService.getCurrentUserId(), startIso, endIso)
      .subscribe({
        next: (logs) => {
          this.currentLogs = logs || [];
          this.processLogsIntoTable();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Eroare la încărcarea rapoartelor:', err),
      });
  }

  get selectedAnimal(): Animal | undefined {
    return this.farm.getAnimalById(this.selectedAnimalId);
  }

  toggleAnimalSelect(): void {
    this.isAnimalSelectOpen = !this.isAnimalSelectOpen;
  }

  selectAnimal(animal: Animal): void {
    this.selectedAnimalId = animal.id;
    this.isAnimalSelectOpen = false;
  }

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
      const filtered = this.currentLogs.filter((l) => l.date >= fromIso && l.date <= toIso);
      const total = filtered.reduce((sum, l) => sum + this.getValueForCategory(l), 0);
      return { label: `${b.from}-${b.to}`, total };
    });

    this.total = this.processedRows.reduce((s, r) => s + r.total, 0);

    if (this.charts) {
      this.charts.forEach((c) => c.update());
    }
  }

  private getValueForCategory(entry: DailyLogEntry): number {
    switch (this.category) {
      case 'lapte':
        return (
          (entry.milkCow || 0) + (entry.milkGoat || 0) + (entry.milkSheep || 0) + (entry.milk || 0)
        );
      case 'lapte_vaca':
        return entry.milkCow || 0;
      case 'lapte_capra':
        return entry.milkGoat || 0;
      case 'lapte_oaie':
        return entry.milkSheep || 0;
      case 'oua':
        return entry.eggs || 0;
      case 'lana':
        return entry.wool || 0;
      case 'ore_munca':
        return entry.workHours || 0;
      case 'carne':
        return entry.meat || 0;
      default:
        return 0;
    }
  }

  get animals(): Animal[] {
    return this.farm.getAnimals();
  }

  get tableRows(): { label: string; total: number }[] {
    return this.processedRows;
  }

  get unit(): string {
    switch (this.category) {
      case 'lapte':
      case 'lapte_vaca':
      case 'lapte_capra':
      case 'lapte_oaie':
        return 'L';
      case 'oua':
        return 'ouă';
      case 'lana':
      case 'carne':
        return 'kg';
      case 'ore_munca':
        return 'ore';
      default:
        return '';
    }
  }

  onToggleView(event: any): void {
    this.view = event.target?.checked ? 'chart' : 'table';
    this.trackingService.setPreference('preferred_view', this.view);
  }

  onCategoryChange(newCategory: FarmProductCategory): void {
    this.category = newCategory as FarmProductCategory;
    this.trackingService.setPreference('last_category', newCategory);
    this.processLogsIntoTable();
    this.cdr.detectChanges();
  }

  get chartData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.processedRows.map((r) => r.label),
      datasets: [
        {
          data: this.processedRows.map((r) => r.total),
          label: `${this.category} (${this.unit})`,
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

  private monthStartIso(): string {
    return `${this.year}-${String(this.monthIndex + 1).padStart(2, '0')}-01`;
  }

  private monthEndIso(): string {
    const d = new Date(this.year, this.monthIndex + 1, 0);
    return `${this.year}-${String(this.monthIndex + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
