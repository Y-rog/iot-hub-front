import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/services/api.service';
import { Device } from '../core/models/device.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.scss'
})
export class DevicesComponent implements OnInit, OnDestroy {

  devices: Device[] = [];
  loading = true;
  error: string | null = null;

  private subscription: Subscription = new Subscription();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.loading = true;
    this.subscription.add(
      this.apiService.getDevices().subscribe({
        next: (data) => {
          this.devices = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des appareils';
          console.error(err);
          this.loading = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Évite les memory leaks !
    this.subscription.unsubscribe();
  }
}
