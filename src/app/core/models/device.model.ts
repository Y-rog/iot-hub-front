export interface Device {
  id: string;
  name: string;
  type: 'AIR_QUALITY' | 'THERMOSTAT';
  brand: 'AIRTHINGS' | 'SINOPE';
  connected: boolean;
  lastSeen: string;
}