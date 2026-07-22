import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {

  constructor(private swPush: SwPush, private http: HttpClient) {}

  subscribeToNotifications(): void {
    if (!this.swPush.isEnabled) {
      console.warn('Service worker non actif — notifications indisponibles');
      return;
    }

    this.http.get(`${environment.apiUrl}/push/vapid-public-key`, { responseType: 'text' })
      .subscribe(publicKey => {
        this.swPush.requestSubscription({ serverPublicKey: publicKey })
          .then(subscription => {
            this.http.post(`${environment.apiUrl}/push/subscribe`, subscription).subscribe({
              next: () => console.log('Abonnement push enregistré'),
              error: (err) => console.error('Erreur envoi abonnement au serveur', err)
            });
          })
          .catch(err => console.error('Erreur abonnement push', err));
      });
  }
}