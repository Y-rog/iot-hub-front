import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Device } from '../../core/models/device.model';

@Component({
  selector: 'app-thermostat-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './thermostat-card.component.html',
  styleUrl: './thermostat-card.component.scss'
})
export class ThermostatCardComponent implements OnChanges {

  // Données reçues du parent
  @Input() device!: Device;

  // Température actuelle du thermostat
  @Input() currentTemp: number | null = null;

  // Le parent nous dit si une requête est en cours pour CE device
  @Input() isUpdating = false;

  // Événement émis quand on règle la température
  @Output() temperatureSet = new EventEmitter<{ deviceId: string, temperature: number }>();

  // Valeur saisie dans l'input
  temperature: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    // Pré-remplit le champ avec la température actuelle,
    // seulement si l'utilisateur n'a rien tapé lui-même
    if (changes['currentTemp'] && this.temperature === null && this.currentTemp !== null) {
      this.temperature = this.currentTemp;
    }
  }

  // Formate le nom du device
  // ex: "thermostat-salon" → "Salon"
  formatDeviceName(name: string): string {
    return name
      .replace('thermostat-', '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Émet l'événement de changement de température
  onSetTemperature(): void {
    if (this.temperature !== null && !this.isUpdating) {
      this.temperatureSet.emit({
        deviceId: this.device.id,
        temperature: this.temperature
      });
    }
  }
}