# IoT Hub — Frontend

Dashboard Angular pour piloter et surveiller mon installation domotique personnelle : capteurs de qualité d'air Airthings et thermostats Zigbee Sinopé, connectés à mon API IoT Hub (https://github.com/Y-rog/api-iot-hub) auto-hébergée sur Raspberry Pi.

## Fonctionnalités

- Capteurs Airthings — température, CO2, humidité, radon, VOC, pression, particules fines (PM1/PM2.5) en temps réel
- Thermostats Sinopé — lecture et réglage de la température via MQTT/Zigbee, individuellement ou en un clic pour tous les thermostats
- Alertes — notifications automatiques sur seuils dépassés (qualité d'air, radon...)
- Dashboard responsive — mise en page adaptée desktop et mobile

## Stack technique

- Angular 18 (standalone components)
- Angular Material (thème sombre personnalisé)
- RxJS pour la gestion des flux de données
- TypeScript strict

## Architecture

src/app/
  dashboard/          Page principale
  shared/
    stats-row/          Compteurs (capteurs / thermostats / alertes)
    airthings-card/     Carte capteur de qualité d'air
    thermostat-card/    Carte thermostat (lecture + réglage)
    alert-card/         Carte alerte
  core/
    services/        ApiService (communication avec le backend)
    model/            Interfaces TypeScript (Device, Alert, DataPoint)

## Prérequis

- Node.js 20+
- Angular CLI 18
- L'API backend (https://github.com/Y-rog/api-iot-hub) doit être démarrée et accessible

## Installation

npm install

## Configuration

L'URL de l'API est définie dans src/environments/environment.ts :

export const environment = {
  production: false,
  apiUrl: 'http://<votre-ip>:8090/api'
};

## Démarrage

ng serve

L'application est accessible sur http://localhost:4200.

## Projet complet

Ce frontend fonctionne avec :
- api-iot-hub (https://github.com/Y-rog/api-iot-hub) — le backend Spring Boot
- Un Raspberry Pi 4 exécutant Zigbee2MQTT + Mosquitto pour la communication avec les appareils Zigbee

---

Projet personnel réalisé par Grégory Fulgueiras (https://y-rog.com) dans le cadre de l'apprentissage de l'architecture hexagonale et de l'intégration IoT.