import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { PushNotificationService } from '../core/services/push-notification.service';
import { DashboardDataService } from '../core/services/dashboard-data.service';
import { Device } from '../core/models/device.model';
import { Alert } from '../core/models/alert.model';
import { Subscription } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StatsRowComponent } from '../shared/stats-row/stats-row.component';
import { AirthingsCardComponent } from '../shared/airthings-card/airthings-card.component';
import { ThermostatCardComponent } from '../shared/thermostat-card/thermostat-card.component';
import { AlertCardComponent } from '../shared/alert-card/alert-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    StatsRowComponent,
    AirthingsCardComponent,
    ThermostatCardComponent,
    AlertCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  devices: Device[] = [];
  alerts: Alert[] = [];
  loading = true;
  error: string | null = null;
  sensorData: { [deviceId: string]: { [sensor: string]: number } } = {};
  thermostatTemps: { [deviceId: string]: number } = {};
  globalTemperature: number | null = null;
  updatingDeviceIds = new Set<string>();

  private subscription = new Subscription();

  // Intervalle de rafraîchissement automatique (5 minutes)
  private readonly REFRESH_INTERVAL_MS = 5 * 60 * 1000;

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router,
    private pushNotificationService: PushNotificationService,
    private dashboardData: DashboardDataService
  ) {}

  ngOnInit(): void {
    this.subscription.add(this.dashboardData.devices$.subscribe(d => this.devices = d));
    this.subscription.add(this.dashboardData.alerts$.subscribe(a => this.alerts = a));
    this.subscription.add(this.dashboardData.sensorData$.subscribe(s => this.sensorData = s));
    this.subscription.add(this.dashboardData.thermostatTemps$.subscribe(t => this.thermostatTemps = t));
    this.subscription.add(this.dashboardData.loading$.subscribe(l => this.loading = l));
    this.subscription.add(this.dashboardData.error$.subscribe(e => this.error = e));

    this.dashboardData.loadAll();
    this.pushNotificationService.subscribeToNotifications();

    // Rafraîchit automatiquement toutes les 5 minutes
    this.subscription.add(
      interval(this.REFRESH_INTERVAL_MS).subscribe(() => {
        this.dashboardData.loadAll();
      })
    );
  }

  get airthingsDevices(): Device[] {
    return this.devices.filter(d => d.brand === 'AIRTHINGS');
  }

  get sinopeDevices(): Device[] {
    return this.devices.filter(d => d.brand === 'SINOPE');
  }

  get unreadAlerts(): Alert[] {
    return this.alerts.filter(a => !a.read);
  }

  isUpdating(deviceId: string): boolean {
    return this.updatingDeviceIds.has(deviceId);
  }

  setTemperature(event: { deviceId: string, temperature: number }): void {
    this.updatingDeviceIds.add(event.deviceId);

    this.subscription.add(
      this.apiService.setTemperature(event.deviceId, event.temperature).subscribe({
        next: () => {
          this.dashboardData.updateThermostatTemp(event.deviceId, event.temperature);
          this.updatingDeviceIds.delete(event.deviceId);
        },
        error: () => {
          this.updatingDeviceIds.delete(event.deviceId);
          this.snackBar.open('Erreur : impossible de régler la température', 'Fermer', { duration: 4000 });
        }
      })
    );
  }

  setAllTemperatures(): void {
    if (!this.globalTemperature) return;
    const temp = this.globalTemperature;

    this.sinopeDevices.forEach(device => {
      this.updatingDeviceIds.add(device.id);

      this.subscription.add(
        this.apiService.setTemperature(device.id, temp).subscribe({
          next: () => {
            this.dashboardData.updateThermostatTemp(device.id, temp);
            this.updatingDeviceIds.delete(device.id);
          },
          error: () => {
            this.updatingDeviceIds.delete(device.id);
            this.snackBar.open(`Erreur température → ${this.formatDeviceName(device.name)}`, 'Fermer', { duration: 4000 });
          }
        })
      );
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private formatDeviceName(name: string): string {
    return name
      .replace('thermostat-', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}