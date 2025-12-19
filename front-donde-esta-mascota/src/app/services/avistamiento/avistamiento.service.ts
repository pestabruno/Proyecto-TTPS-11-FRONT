import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Avistamiento } from '../../interfaces/estado.interface';
import { isPlatformBrowser } from '@angular/common';
import { EstadoApiService } from '../estado-api';

@Injectable({
  providedIn: 'root'
})
export class AvistamientoService {
  private apiUrl = 'http://localhost:8080/api/avistamientos';
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private estadoApi = inject(EstadoApiService);

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  obtenerTodos(): Observable<Avistamiento[]> {
    // Marcar como cargando
    this.estadoApi.actualizarEstado({ 
      cargandoAvistamientos: true, 
      errorAvistamientos: null 
    });

    return this.http.get<Avistamiento[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((avistamientos) => {
        // Actualizar el estado con los avistamientos
        this.estadoApi.setAvistamientos(avistamientos);
        // Marcar como terminado de cargar
        this.estadoApi.actualizarEstado({ cargandoAvistamientos: false });
      })
    );
  }

  crearAvistamiento(reportanteId: number, avistamiento: any): Observable<any> {
    const url = `${this.apiUrl}/${reportanteId}`;
    return this.http.post<any>(url, avistamiento, { 
      headers: this.getHeaders() 
    }).pipe(
      tap((nuevoAvistamiento) => {
        this.estadoApi.agregarNuevoAvistamiento(nuevoAvistamiento);
      })
    );
  }
}