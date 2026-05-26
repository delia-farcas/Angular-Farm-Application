import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[app-activity-row]',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'observation') {
      <td>{{ data.userId || 'GUEST' }}</td>
      <td>{{ data.violationType }}</td>
      <td>
        <span class="risk-badge" [attr.data-risk]="data.riskLevel">{{ data.riskLevel }}</span>
      </td>
      <td><button class="resolve-btn" (click)="resolve.emit(data.id)">Rezolvă</button></td>
    } @else {
      <td>{{ data.createdAt | date: 'short' }}</td>
      <td>{{ data.ipAddress }}</td>
      <td>{{ data.actionInfo }}</td>
      <td>
        <span class="status-badge" [class.error]="data.statusCode >= 400">{{
          data.statusCode
        }}</span>
      </td>
    }
  `,
  styleUrls: ['./activity-row-component.css'],
})
export class ActivityRowComponent {
  @Input({ required: true }) data: any;
  @Input({ required: true }) type: 'observation' | 'log' = 'log';
  @Output() resolve = new EventEmitter<number>();
}
