import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';
import { EstadoApiService } from '../../services/estado-api';
import { AppEstado, Publicacion } from '../../interfaces/estado.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private estadoApi = inject(EstadoApiService);
  private router = inject(Router);

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private estadoSub?: Subscription;

  private fixMarkerIcons(): void {
    const iconDefault = L.icon({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  ngAfterViewInit(): void {
    this.fixMarkerIcons();
    this.initMap();
    this.suscribirAEstado();
  }

  ngOnDestroy(): void {
    this.estadoSub?.unsubscribe();
  }

  private initMap(): void {
    this.map = L.map('map').setView([-34.9214, -57.9545], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  private suscribirAEstado(): void {
    this.estadoSub = this.estadoApi.estado$.subscribe((estado: AppEstado) => {
      const conGeo = estado.publicacionesGlobales.filter((p) => p.latitud && p.longitud);

      if (this.map) {
        if (estado.usuario?.latitud && estado.usuario?.longitud) {
          this.map.setView([estado.usuario.latitud, estado.usuario.longitud], 13);
        }
        this.actualizarMarcadores(conGeo);
      } else {
        setTimeout(() => this.suscribirAEstado(), 100);
      }
    });
  }

  private actualizarMarcadores(publicaciones: Publicacion[]): void {
    this.markersLayer.clearLayers();

    publicaciones.forEach((pub) => {
      const marker = L.marker([pub.latitud!, pub.longitud!]);

      const popupContent = `
        <div style="font-family: sans-serif; text-align: center;">
          <strong style="font-size: 14px;">${pub.calle} ${pub.altura}</strong><br>
          <span style="color: #666;">${pub.localidad}</span><br>
          <button id="btn-map-${pub.id}" style="
            margin-top: 8px;
            background: #007bff;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;">
            Ver Detalle
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-map-${pub.id}`);
        if (btn) {
          btn.onclick = () => this.router.navigate(['/publicacion', pub.id]);
        }
      });

      this.markersLayer.addLayer(marker);
    });
  }
}
