# IoT Hub — Frontend

Dashboard Angular pour piloter et surveiller mon installation domotique personnelle : capteurs de qualité d'air Airthings et thermostats Zigbee Sinopé, connectés à mon API IoT Hub (https://github.com/Y-rog/api-iot-hub) auto-hébergée sur Raspberry Pi.

Application déployée en production : https://iot-hub.y-rog.com (accès privé, authentification requise)

## Fonctionnalités

- Capteurs Airthings — température, CO2, humidité, radon, VOC, pression, particules fines (PM1/PM2.5) en temps réel
- Thermostats Sinopé — lecture et réglage de la température via MQTT/Zigbee, individuellement ou en un clic pour tous les thermostats
- Alertes et notifications push — notifications en temps réel sur seuils dépassés (CO2, radon, VOC, particules fines), fonctionnelles sur navigateur (Chrome/Android) et mobile (Safari/iOS)
- Authentification — connexion par compte utilisateur, session JWT persistante
- Application mobile progressive (PWA) — installable depuis l'écran d'accueil, fonctionne comme une application native
- Rafraîchissement automatique — mise à jour des données toutes les 5 minutes, avec indicateur de dernière synchronisation
- Dashboard responsive — mise en page adaptée desktop et mobile

## Stack technique

- Angular 18 (standalone components)
- Angular Material (thème sombre personnalisé)
- RxJS pour la gestion des flux de données (BehaviorSubject)
- Service Worker / PWA (@angular/pwa)
- TypeScript strict

## Architecture

src/app/
  login/                Page de connexion
  dashboard/            Page principale
  shared/
    stats-row/          Compteurs (capteurs / thermostats / alertes)
    airthings-card/     Carte capteur de qualité d'air
    thermostat-card/    Carte thermostat (lecture + réglage)
    alert-card/         Carte alerte
  core/
    services/           ApiService, AuthService, DashboardDataService, PushNotificationService
    guards/              AuthGuard (protection des routes)
    interceptors/        AuthInterceptor (injection automatique du token JWT)
    model/               Interfaces TypeScript (Device, Alert, DataPoint)

## Prérequis

- Node.js 20+
- Angular CLI 18
- L'API backend (https://github.com/Y-rog/api-iot-hub) doit être démarrée et accessible

## Installation

npm install

## Configuration

L'URL de l'API est définie dans src/environments/environment.ts (développement) et environment.prod.ts (production) :

export const environment = {
  production: false,
  apiUrl: 'http://<votre-ip>:8090/api'
};

## Démarrage

ng serve

L'application est accessible sur http://localhost:4200.

## Build production

ng build --configuration production

Le service worker (notifications push, mode hors ligne) ne s'active qu'en mode production, jamais avec ng serve.

## Authentification

L'accès au dashboard nécessite un compte utilisateur, créé côté backend. Voir le README du backend pour la procédure de création de compte.

## Projet complet

Ce frontend fonctionne avec :
- api-iot-hub (https://github.com/Y-rog/api-iot-hub) — le backend Spring Boot (architecture hexagonale, JWT, notifications push)
- Un Raspberry Pi 4 exécutant Zigbee2MQTT + Mosquitto pour la communication avec les appareils Zigbee
- Un tunnel Tailscale reliant le serveur de déploiement au Raspberry Pi
- Un VPS avec Nginx et Let's Encrypt pour le HTTPS en production

---

Projet personnel réalisé par Grégory Fulgueiras (https://y-rog.com) dans le cadre de l'apprentissage de l'architecture hexagonale, de la sécurité applicative et de l'intégration IoT.