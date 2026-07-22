import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { Device } from '../models/device.model';
import { Alert } from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {

  private devicesSubject = new BehaviorSubject<Device[]>([]);
  devices$ = this.devicesSubject.asObservable();

  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  alerts$ = this.alertsSubject.asObservable();

  private sensorDataSubject = new BehaviorSubject<{ [deviceId: string]: { [sensor: string]: number } }>({});
  sensorData$ = this.sensorDataSubject.asObservable();

  private thermostatTempsSubject = new BehaviorSubject<{ [deviceId: string]: number }>({});
  thermostatTemps$ = this.thermostatTempsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  constructor(private apiService: ApiService) {}

  // Charge tout : devices, alertes, mesures capteurs, températures thermostats
  loadAll(): void {
    this.loadingSubject.next(true);

    this.apiService.getDevices().subscribe({
      next: (data) => {
        this.devicesSubject.next(data);
        this.loadingSubject.next(false);

        data.filter(d => d.brand === 'AIRTHINGS')
            .forEach(d => this.loadSensorData(d.id));

        data.filter(d => d.brand === 'SINOPE')
            .forEach(d => this.loadThermostatTemp(d.id));
      },
      error: () => {
        this.errorSubject.next('Erreur chargement devices');
        this.loadingSubject.next(false);
      }
    });

    this.apiService.getAlerts().subscribe({
      next: (data) => this.alertsSubject.next(data),
      error: () => console.error('Erreur chargement alertes')
    });
  }

  private loadSensorData(deviceId: string): void {
    this.apiService.getHistory(deviceId).subscribe({
      next: (dataPoints) => {
        const latest: { [sensor: string]: number } = {};
        dataPoints.forEach(dp => latest[dp.sensorType] = dp.value);

        const current = this.sensorDataSubject.value;
        this.sensorDataSubject.next({ ...current, [deviceId]: latest });
      },
      error: () => console.error('Erreur chargement mesures Airthings')
    });
  }

  private loadThermostatTemp(deviceId: string): void {
    this.apiService.getHistory(deviceId).subscribe({
      next: (dataPoints) => {
        const tempPoint = dataPoints
          .filter(dp => dp.sensorType === 'temperature')
          .pop();

        if (tempPoint) {
          const current = this.thermostatTempsSubject.value;
          this.thermostatTempsSubject.next({ ...current, [deviceId]: tempPoint.value });
        }
      },
      error: () => console.error('Erreur chargement température thermostat')
    });
  }

  // Met à jour la température locale après un succès de setTemperature
  updateThermostatTemp(deviceId: string, temperature: number): void {
    const current = this.thermostatTempsSubject.value;
    this.thermostatTempsSubject.next({ ...current, [deviceId]: temperature });
  }

  get currentDevices(): Device[] {
    return this.devicesSubject.value;
  }
}