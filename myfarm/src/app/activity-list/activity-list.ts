import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../services/user.service';
import { ActivityRowComponent } from '../activity-row-component/activity-row-component';

@Component({
  selector: 'app-activity-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ActivityRowComponent],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css',
})
export class ActivityList implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  observations: any[] = [];
  logs: any[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const [observations, logs] = await Promise.all([
        firstValueFrom(this.userService.getObservations()),
        firstValueFrom(this.userService.getLogs()),
      ]);
      this.observations = observations;
      this.logs = logs;
    } catch (err) {
      console.error('Eroare la încărcarea datelor de activitate:', err);
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async resolveObservation(id: number): Promise<void> {
    try {
      await firstValueFrom(this.userService.resolveObservation(id));
      await this.loadData();
    } catch (err) {
      console.error('Eroare la rezolvarea observației:', err);
    }
  }
}
