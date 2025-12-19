import { Component, Input, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa-detalle',
  standalone: true,
  imports: [CommonModule],
  template: `<div #mapContainer class="map-container"></div>`,
  styles: [
    `
      .map-container {
        height: 450px;
        width: 100%;
        border-radius: 8px;
        border: 1px solid #ddd;
      }
    `,
  ],
})
export class MapaDetalleComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  @Input() lat!: number;
  @Input() lng!: number;
  @Input() nombreMascota: string = 'Mascota';
  @Input() avistamientos: any[] = [];

  private map?: L.Map;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Pequeño delay para asegurar que el contenedor tiene dimensiones reales
    setTimeout(() => {
      this.map = L.map(this.mapContainer.nativeElement).setView([this.lat, this.lng], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(this.map);

      // Iconos
      const iconRed = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const iconYellow = L.icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Marcador Mascota
      L.marker([this.lat, this.lng], { icon: iconRed })
        .addTo(this.map)
        .bindPopup(`<b>Origen: ${this.nombreMascota}</b>`)
        .openPopup();

      // Avistamientos
      this.avistamientos?.forEach((a) => {
        if (a.latitud && a.longitud) {
          L.marker([parseFloat(a.latitud), parseFloat(a.longitud)], { icon: iconYellow })
            .addTo(this.map!)
            .bindPopup(`<b>Avistamiento</b><br>${a.fecha}<br>${a.descripcion || ''}`);
        }
      });

      // Forzar ajuste de tamaño
      this.map.invalidateSize();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
