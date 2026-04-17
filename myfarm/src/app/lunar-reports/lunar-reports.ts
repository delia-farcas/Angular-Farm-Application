import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { FarmService } from '../services/farm.service';
import { Animal, FarmProductCategory } from '../models/farm';

@Component({
  selector: 'app-lunar-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './lunar-reports.html',
  styleUrl: './lunar-reports.css',
})
export class LunarReports {
  view: 'table' | 'chart' = 'table';
  category: FarmProductCategory = 'lapte';
  selectedAnimalId: number;

  // current month/year (simple default)
  private readonly now = new Date();
  private readonly year = this.now.getFullYear();
  private readonly monthIndex = this.now.getMonth(); // 0-11

  constructor(private farm: FarmService) {
    this.selectedAnimalId = this.farm.getAnimals()[0]?.id ?? 1;
  }

  get animals(): Animal[] {
    return this.farm.getAnimals();
  }

  get selectedAnimal(): Animal | undefined {
    return this.farm.getAnimalById(this.selectedAnimalId);
  }

  private getValueForCategory(entry: { milk: number; eggs: number; wool: number; workHours: number; meat: number }): number {
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
    }
  }

  private monthStartIso(): string {
    const d = new Date(this.year, this.monthIndex, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private monthEndIso(): string {
    const d = new Date(this.year, this.monthIndex + 1, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** Weeks: 1-7, 8-14, 15-21, 22-end */
  get tableRows(): { label: string; total: number }[] {
    const startIso = this.monthStartIso();
    const endIso = this.monthEndIso();
    const logs = this.farm.getLogsInRange(this.selectedAnimalId, startIso, endIso);

    const endDay = new Date(this.year, this.monthIndex + 1, 0).getDate();
    const buckets: Array<{ from: number; to: number }> = [
      { from: 1, to: Math.min(7, endDay) },
      { from: 8, to: Math.min(14, endDay) },
      { from: 15, to: Math.min(21, endDay) },
      { from: 22, to: endDay },
    ].filter(b => b.from <= b.to);

    const pad = (n: number) => String(n).padStart(2, '0');
    const month = pad(this.monthIndex + 1);
    const year = this.year;

    return buckets.map(b => {
      const fromIso = `${year}-${month}-${pad(b.from)}`;
      const toIso = `${year}-${month}-${pad(b.to)}`;
      const total = logs
        .filter(l => l.date >= fromIso && l.date <= toIso)
        .reduce((sum, l) => sum + this.getValueForCategory(l), 0);
      return { label: `${b.from}-${b.to}`, total };
    });
  }

  get total(): number {
    return this.tableRows.reduce((s, r) => s + r.total, 0);
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
    const labels = this.tableRows.map(r => r.label);
    const data = this.tableRows.map(r => r.total);
    return {
      labels,
      datasets: [
        {
          data,
          label: `${this.selectedAnimal?.name ?? 'Animal'} • ${this.category}`,
          tension: 0.35,
          fill: false,
        },
      ],
    };
  }

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } },
  };

  onToggleView(event: any): void {
  // Verificăm dacă evenimentul are un target și dacă target-ul are proprietatea 'checked'
  const isChecked = event.target?.checked; 
  this.view = isChecked ? 'chart' : 'table';
  }
}
