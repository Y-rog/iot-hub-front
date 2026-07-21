import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Device } from '../../core/models/device.model';
import { Alert } from '../../core/models/alert.model';

@Component({
  selector: 'app-stats-row',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './stats-row.component.html',
  styleUrl: './stats-row.component.scss'
})
export class StatsRowComponent {
  @Input() devices: Device[] = [];
  @Input() alerts: Alert[] = [];

  get capteurCount(): number {
    return this.devices.filter(d => d.brand === 'AIRTHINGS').length;
  }

  get thermostatCount(): number {
    return this.devices.filter(d => d.brand === 'SINOPE').length;
  }

  get unreadAlertsCount(): number {
    return this.alerts.filter(a => !a.read).length;
  }
}