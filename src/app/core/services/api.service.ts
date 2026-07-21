import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Device } from '../models/device.model';
import { DataPoint } from '../models/data-point.model';
import { environment } from '../../../environments/environment';
import { Alert } from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // URL de l'API, définie selon l'environnement (dev/prod)
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Devices
  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.apiUrl}/devices`);
  }

  // Alertes
  getAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiUrl}/alerts`);
  }

  // Historique
  getHistory(deviceId: string): Observable<DataPoint[]> {
    return this.http.get<DataPoint[]>(`${this.apiUrl}/history/${deviceId}`);
  }

  // Thermostat
  setTemperature(deviceId: string, temperature: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/thermostats/${deviceId}/temperature`,
      { temperature }
    );
  }
}