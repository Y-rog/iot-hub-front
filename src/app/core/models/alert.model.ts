export interface Alert {
  id: string;
  deviceId: string;
  sensorType: string;
  message: string;
  value: number;
  createdAt: string;
  read: boolean;
}