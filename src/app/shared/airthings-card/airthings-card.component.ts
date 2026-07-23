import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Device } from '../../core/models/device.model';

@Component({
  selector: 'app-airthings-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './airthings-card.component.html',
  styleUrl: './airthings-card.component.scss'
})
export class AirthingsCardComponent {

  // Données reçues du composant parent
  @Input() device!: Device;
  @Input() sensorData: { [sensor: string]: number } | null = null;

  // État du menu dépliable (mobile)
  isExpanded = false;

  // Formate le nom du device pour l'affichage
  // ex: "view-plus-sous-sol" → "View Plus Sous Sol"
  formatDeviceName(name: string): string {
  const withoutPrefix = name
    .replace(/^Air View /i, '')
    .replace(/^View Plus /i, '');

  return withoutPrefix
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

  // Retourne le statut de qualité selon le type de capteur et sa valeur
  // Valeurs possibles : 'good', 'medium', 'bad', 'critical'
  getSensorStatus(sensorType: string, value: number): string {
    switch (sensorType) {

      case 'co2': // ppm
        if (value < 600)  return 'good';
        if (value < 1000) return 'medium';
        if (value < 2000) return 'bad';
        return 'critical';

      case 'temp': // °C
        if (value >= 18 && value <= 22) return 'good';
        if (value >= 15 && value <= 25) return 'medium';
        if (value >= 10 && value <= 30) return 'bad';
        return 'critical';

      case 'humidity': // %
        if (value >= 40 && value <= 60) return 'good';
        if (value >= 30 && value <= 70) return 'medium';
        if (value >= 20 && value <= 80) return 'bad';
        return 'critical';

      case 'radonShortTermAvg': // Bq/m³
        if (value < 100) return 'good';
        if (value < 150) return 'medium';
        if (value < 200) return 'bad';
        return 'critical';

      case 'voc': // ppb
        if (value < 250)  return 'good';
        if (value < 1000) return 'medium';
        if (value < 2000) return 'bad';
        return 'critical';

      case 'pm25': // μg/m³
        if (value < 10) return 'good';
        if (value < 25) return 'medium';
        if (value < 50) return 'bad';
        return 'critical';

      case 'pm1': // μg/m³
        if (value < 10) return 'good';
        if (value < 20) return 'medium';
        if (value < 35) return 'bad';
        return 'critical';

      default:
        return 'good';
    }
  }

  // Ouvre/ferme le menu dépliable sur mobile
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  // Retourne true si au moins un capteur est en état mauvais ou critique
  // Utilisé pour afficher le point rouge d'alerte
  hasAlert(): boolean {
    if (!this.sensorData) return false;
    return Object.entries(this.sensorData).some(([key, value]) => {
      const status = this.getSensorStatus(key, value);
      return status === 'bad' || status === 'critical';
    });
  }
}

