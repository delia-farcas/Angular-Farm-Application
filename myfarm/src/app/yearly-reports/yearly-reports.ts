import { Component, ViewChildren, QueryList, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { FarmService } from '../services/farm.service';
import { Animal, FarmProductCategory, DailyLogEntry } from '../models/farm';
import { UserTrackingService } from '../services/user-tracking.service';

@Component({
  selector: 'app-yearly-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './yearly-reports.html',
  styleUrl: './yearly-reports.css',
})
export class YearlyReports implements OnInit {
  view: 'table' | 'chart' = 'table';
  category: FarmProductCategory = 'lapte';
  selectedAnimalId: number;

  private readonly year = new Date().getFullYear();

  currentLogs: DailyLogEntry[] = [];
  processedRows: { label: string; total: number }[] = [];
  grandTotal = 0;

  private trackingService = inject(UserTrackingService);
  private farm = inject(FarmService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  constructor() {
    this.selectedAnimalId = this.farm.getAnimals()[0]?.id ?? 1;
  }

  ngOnInit() {
    this.refreshData();
  }

  get animals(): Animal[] {
    return this.farm.getAnimals();
  }

  get selectedAnimal(): Animal | undefined {
    return this.farm.getAnimalById(this.selectedAnimalId);
  }

  refreshData(): void {
    const start = `${this.year}-01-01`;
    const end = `${this.year}-12-31`;
    const userId = this.trackingService.getCurrentUserId();

    this.farm.getLogsInRange(userId, start, end).subscribe({
      next: (logs) => {
        this.currentLogs = logs || [];
        this.processLogsIntoTable();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  private processLogsIntoTable(): void {
    const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.processedRows = months.map((label, idx) => {
      const prefix = `${this.year}-${this.pad2(idx + 1)}`;
      const total = this.currentLogs
        .filter((l) => l.date && l.date.startsWith(prefix))
        .reduce((sum, l) => sum + this.getValueForCategory(l), 0);
      return { label, total };
    });

    this.grandTotal = this.processedRows.reduce((s, r) => s + r.total, 0);

    if (this.charts) {
      this.charts.forEach((c) => c.update());
    }
  }

  private getValueForCategory(entry: DailyLogEntry): number {
    switch (this.category) {
      case 'lapte':
        return (entry.milkCow || 0) + (entry.milkGoat || 0) + (entry.milkSheep || 0) + (entry.milk || 0);
      case 'lapte_vaca': return entry.milkCow || 0;
      case 'lapte_capra': return entry.milkGoat || 0;
      case 'lapte_oaie': return entry.milkSheep || 0;
      case 'oua': return entry.eggs || 0;
      case 'lana': return entry.wool || 0;
      case 'ore_munca': return entry.workHours || 0;
      case 'carne': return entry.meat || 0;
      default: return 0;
    }
  }

  private pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  get unit(): string {
    switch (this.category) {
      case 'lapte':
      case 'lapte_vaca':
      case 'lapte_capra':
      case 'lapte_oaie': return 'L';
      case 'oua': return 'ouă';
      case 'lana':
      case 'carne': return 'kg';
      case 'ore_munca': return 'ore';
      default: return '';
    }
  }

  get tableRows(): { label: string; total: number }[] {
    return this.processedRows;
  }

  get total(): number {
    return this.grandTotal;
  }

  get chartData(): ChartConfiguration<'line'>['data'] {
    return {
      labels: this.processedRows.map((r) => r.label),
      datasets: [
        {
          data: this.processedRows.map((r) => r.total),
          label: `${this.category} (${this.unit})`,
          tension: 0.35,
          borderColor: '#388333',
          backgroundColor: 'rgba(56, 131, 51, 0.1)',
          fill: true,
        },
      ],
    };
  }

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
  };

  onToggleView(event: any): void {
    this.view = event.target?.checked ? 'chart' : 'table';
  }

  onCategoryChange(newCategory: FarmProductCategory): void {
    this.category = newCategory as FarmProductCategory;
    this.processLogsIntoTable();
    this.cdr.detectChanges();
  }
}