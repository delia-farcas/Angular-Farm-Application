import { Component, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { FarmService } from '../services/farm.service';
import { Animal, FarmProductCategory } from '../models/farm';

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
  

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  constructor(private farm: FarmService, private cdr: ChangeDetectorRef) {
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

  private pad2(n: number): string {
    return String(n).padStart(2, '0');
  }

  get tableRows(): { label: string; total: number }[] {
    const months = [
      'Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
      'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'
    ];

    return months.map((label, idx) => {
      const start = `${this.year}-${this.pad2(idx + 1)}-01`;
      const endDate = new Date(this.year, idx + 1, 0).getDate();
      const end = `${this.year}-${this.pad2(idx + 1)}-${this.pad2(endDate)}`;
      const logs = this.farm.getLogsInRange(this.selectedAnimalId, start, end);
      const total = logs.reduce((sum, l) => sum + this.getValueForCategory(l), 0);
      return { label, total };
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
        // --- ADĂUGAT PENTRU CULOARE ---
        borderColor: '#388333',           // Culoarea liniei
        pointBackgroundColor: '#388333',  // Culoarea punctelor
        pointBorderColor: '#fff',         // Conturul punctelor (le face mai vizibile)
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#388333',
        // ------------------------------
      },
    ],
  };
}

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true} },
    scales: { y: { beginAtZero: true } },
  };

  onToggleView(event: any): void {
  const isChecked = event.target?.checked; 
  this.view = isChecked ? 'chart' : 'table';
}

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

  stopGenerator() {
    if (this.generatorId) {
      clearInterval(this.generatorId);
    }
  }

  updateCharts(): void {
    const animal = this.selectedAnimal;
    if (!animal) return;

    const m = Math.floor(Math.random() * 12) + 1;
    const d = Math.floor(Math.random() * 28) + 1;
    const dateStr = `${this.year}-${this.pad2(m)}-${this.pad2(d)}`;
    
    let existing = animal.logs.find(l => l.date === dateStr);
    if (!existing) {
      existing = { date: dateStr, milk: 0, eggs: 0, wool: 0, workHours: 0, meat: 0 };
      animal.logs.push(existing);
    }
    
    const randomAdd = Math.floor(Math.random() * 20) + 1;
    switch (this.category) {
      case 'lapte': existing.milk += randomAdd; break;
      case 'oua': existing.eggs += randomAdd; break;
      case 'lana': existing.wool += randomAdd; break;
      case 'ore_munca': existing.workHours += randomAdd; break;
      case 'carne': existing.meat += randomAdd; break;
    }
    
    // Explicitly trigger CD and update charts for real time view
    this.cdr.detectChanges();
    if (this.charts) {
      this.charts.forEach(chart => chart.update());
    }
  }
}
