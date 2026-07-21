import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/services/api.service';
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

// Composants enfants
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

  // Données principales
  devices: Device[] = [];
  alerts: Alert[] = [];
  loading = true;
  error: string | null = null;

  // Mesures des capteurs Airthings → { deviceId: { sensorType: value } }
  sensorData: { [deviceId: string]: { [sensor: string]: number } } = {};

  // Températures actuelles des thermostats → { deviceId: temperature }
  thermostatTemps: { [deviceId: string]: number } = {};

  // Température globale pour appliquer à tous les thermostats
  globalTemperature: number | null = null;

  // IDs des thermostats dont la requête PUT est en cours
  updatingDeviceIds = new Set<string>();

  private subscription = new Subscription();

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Charge les devices
    this.subscription.add(
      this.apiService.getDevices().subscribe({
        next: (data) => {
          this.devices = data;
          this.loading = false;

          // Charge les mesures pour chaque capteur Airthings
          data.filter(d => d.brand === 'AIRTHINGS')
              .forEach(d => this.loadSensorData(d.id));

          // Charge la température actuelle de chaque thermostat
          data.filter(d => d.brand === 'SINOPE')
              .forEach(d => this.loadThermostatTemp(d.id));
        },
        error: () => {
          this.error = 'Erreur chargement devices';
          this.loading = false;
        }
      })
    );

    // Charge les alertes
    this.subscription.add(
      this.apiService.getAlerts().subscribe({
        next: (data) => this.alerts = data,
        error: () => console.error('Erreur chargement alertes')
      })
    );
  }

  // Charge l'historique des mesures d'un capteur Airthings
  loadSensorData(deviceId: string): void {
    this.subscription.add(
      this.apiService.getHistory(deviceId).subscribe({
        next: (dataPoints) => {
          const latest: { [sensor: string]: number } = {};
          dataPoints.forEach(dp => latest[dp.sensorType] = dp.value);
          this.sensorData[deviceId] = latest;
        },
        error: () => console.error('Erreur chargement mesures Airthings')
      })
    );
  }

  // Charge la dernière température connue d'un thermostat
  loadThermostatTemp(deviceId: string): void {
    this.subscription.add(
      this.apiService.getHistory(deviceId).subscribe({
        next: (dataPoints) => {
          const tempPoint = dataPoints
            .filter(dp => dp.sensorType === 'temperature')
            .pop();
          if (tempPoint) {
            this.thermostatTemps[deviceId] = tempPoint.value;
          }
        },
        error: () => console.error('Erreur chargement température thermostat')
      })
    );
  }

  // Filtre les capteurs Airthings
  get airthingsDevices(): Device[] {
    return this.devices.filter(d => d.brand === 'AIRTHINGS');
  }

  // Filtre les thermostats Sinopé
  get sinopeDevices(): Device[] {
    return this.devices.filter(d => d.brand === 'SINOPE');
  }

  // Filtre les alertes non lues
  get unreadAlerts(): Alert[] {
    return this.alerts.filter(a => !a.read);
  }

  // Un thermostat est-il en cours de mise à jour ?
  isUpdating(deviceId: string): boolean {
    return this.updatingDeviceIds.has(deviceId);
  }

  // Applique une température à un thermostat spécifique
  setTemperature(event: { deviceId: string, temperature: number }): void {
    this.updatingDeviceIds.add(event.deviceId);

    this.subscription.add(
      this.apiService.setTemperature(event.deviceId, event.temperature).subscribe({
        next: () => {
          this.thermostatTemps[event.deviceId] = event.temperature;
          this.updatingDeviceIds.delete(event.deviceId);
        },
        error: () => {
          this.updatingDeviceIds.delete(event.deviceId);
          this.snackBar.open('Erreur : impossible de régler la température', 'Fermer', { duration: 4000 });
        }
      })
    );
  }

  // Applique la même température à TOUS les thermostats
  setAllTemperatures(): void {
    if (!this.globalTemperature) return;
    const temp = this.globalTemperature;

    this.sinopeDevices.forEach(device => {
      this.updatingDeviceIds.add(device.id);

      this.subscription.add(
        this.apiService.setTemperature(device.id, temp).subscribe({
          next: () => {
            this.thermostatTemps[device.id] = temp;
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

  // Formate le nom du device (utilisé aussi pour les messages d'erreur)
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