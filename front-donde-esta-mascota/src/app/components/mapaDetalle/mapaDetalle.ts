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
  @Input() calle: string = '';
  @Input() altura: string = '';
  @Input() localidad: string = '';
  @Input() avistamientos: any[] = [];

  private map?: L.Map;

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // ✅ Validación de coordenadas
    const lat = parseFloat(String(this.lat));
    const lng = parseFloat(String(this.lng));

    if (isNaN(lat) || isNaN(lng)) {
      console.error('❌ Coordenadas inválidas:', { lat, lng });
      return;
    }

    console.log('🗺️ Inicializando mapa en:', { lat, lng, nombreMascota: this.nombreMascota });

    // Pequeño delay para asegurar que el contenedor tiene dimensiones
    setTimeout(() => {
      // ✅ Inicializar mapa centrado en la publicación
      this.map = L.map(this.mapContainer.nativeElement).setView([lat, lng], 15);

      // ✅ Agregar capa de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(this.map);

      // ============================================
      // ICONOS PERSONALIZADOS
      // ============================================
      
      // 🔴 ICONO ROJO para la publicación (mascota perdida)
      const iconRed = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // 🟡 ICONO AMARILLO para los avistamientos
      const iconYellow = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // ============================================
      // MARCADOR PRINCIPAL (PUBLICACIÓN) - ROJO
      // ============================================
      const direccionPublicacion = this.calle && this.altura 
        ? `${this.calle} ${this.altura}, ${this.localidad}` 
        : this.localidad || 'La Plata';

      const popupPublicacion = `
        <div style="text-align: center; min-width: 180px; font-family: Arial, sans-serif;">
          <div style="background: #dc3545; color: white; padding: 8px; margin: -10px -10px 10px -10px; border-radius: 4px 4px 0 0;">
            <b style="font-size: 15px;">📍 ${this.nombreMascota}</b>
          </div>
          <div style="padding: 5px;">
            <small style="color: #666; font-size: 12px;">
              <b>Ubicación de la mascota perdida:</b><br>
              ${direccionPublicacion}
            </small>
          </div>
        </div>
      `;

      // ✅ Agregar marcador rojo de la publicación
      L.marker([lat, lng], { icon: iconRed })
        .addTo(this.map)
        .bindPopup(popupPublicacion)
        .openPopup();

      console.log(`🔴 Marcador ROJO agregado: ${this.nombreMascota} en [${lat}, ${lng}]`);

      // ============================================
      // MARCADORES DE AVISTAMIENTOS - AMARILLOS
      // ============================================
      if (this.avistamientos && this.avistamientos.length > 0) {
        console.log(`👁️ Procesando ${this.avistamientos.length} avistamientos...`);

        // ✅ CORRECCIÓN: Array de LatLngTuple para bounds
        const bounds: L.LatLngTuple[] = [[lat, lng]];

        this.avistamientos.forEach((avist, index) => {
          const avistLat = parseFloat(String(avist.latitud));
          const avistLng = parseFloat(String(avist.longitud));

          if (!isNaN(avistLat) && !isNaN(avistLng)) {
            const direccionAvist = avist.calle && avist.altura 
              ? `${avist.calle} ${avist.altura}` 
              : 'Ubicación no especificada';

            const popupAvistamiento = `
              <div style="min-width: 200px; font-family: Arial, sans-serif;">
                <div style="background: #ffc107; color: #333; padding: 8px; margin: -10px -10px 10px -10px; border-radius: 4px 4px 0 0;">
                  <b style="font-size: 14px;">👁️ Avistamiento #${index + 1}</b>
                </div>
                <div style="padding: 5px; font-size: 12px;">
                  <p style="margin: 5px 0;">
                    <b>📅 Fecha:</b> ${avist.fecha || 'No especificada'}
                  </p>
                  ${avist.hora ? `<p style="margin: 5px 0;"><b>🕐 Hora:</b> ${avist.hora}</p>` : ''}
                  ${avist.descripcion ? `<p style="margin: 5px 0; color: #555;"><b>📝</b> ${avist.descripcion}</p>` : ''}
                  <p style="margin: 5px 0;">
                    <b>📍 Lugar:</b> ${direccionAvist}
                  </p>
                </div>
              </div>
            `;

            // ✅ Agregar marcador amarillo
            L.marker([avistLat, avistLng], { icon: iconYellow })
              .addTo(this.map!)
              .bindPopup(popupAvistamiento);

            // ✅ Agregar coordenadas al bounds como LatLngTuple
            bounds.push([avistLat, avistLng]);

            console.log(`🟡 Marcador AMARILLO agregado: Avistamiento #${index + 1} en [${avistLat}, ${avistLng}]`);
          } else {
            console.warn(`⚠️ Avistamiento #${index + 1} tiene coordenadas inválidas:`, avist);
          }
        });

        // ============================================
        // AJUSTAR VISTA PARA MOSTRAR TODOS LOS PUNTOS
        // ============================================
        if (bounds.length > 1) {
          // ✅ CORRECCIÓN: fitBounds con array de LatLngTuple
          this.map.fitBounds(bounds, {
            padding: [50, 50], // Margen de 50px
            maxZoom: 15,       // No hacer zoom excesivo
          });
          console.log('🎯 Vista ajustada para mostrar todos los puntos');
        }
      } else {
        console.log('ℹ️ No hay avistamientos para mostrar');
      }

      // ✅ Forzar actualización del tamaño del mapa
      this.map.invalidateSize();
      console.log('✅ Mapa renderizado correctamente');
    }, 100);
  }

    ngOnDestroy(): void {
      if (this.map) {
        this.map.remove();
        console.log('🗑️ Mapa destruido');
      }
    }
  }