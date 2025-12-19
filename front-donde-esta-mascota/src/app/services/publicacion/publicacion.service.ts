import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Publicacion } from '../../interfaces/estado.interface';
import { isPlatformBrowser } from '@angular/common';
import { EstadoApiService } from '../estado-api';

@Injectable({
  providedIn: 'root',
})
export class PublicacionService {
  private apiUrl = 'http://localhost:8080/api/publicaciones';
  private platformId = inject(PLATFORM_ID);
  private estadoApi = inject(EstadoApiService);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();

    // Solo acceder a localStorage en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  obtenerTodas(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap((pubs) => {
        this.estadoApi.setPublicaciones(pubs);
      })
    );
  }

  obtenerPorId(id: number): Observable<Publicacion> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Publicacion>(url, { headers: this.getHeaders() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  editar(id: number, publicacion: Publicacion): Observable<Publicacion> {
    return this.http.put<Publicacion>(`${this.apiUrl}/${id}`, publicacion, {
      headers: this.getHeaders(),
    });
  }

  crearPublicacion(autorId: number, publicacion: any): Observable<any> {
    const url = `${this.apiUrl}/${autorId}`;

    return this.http.post<any>(url, publicacion, { headers: this.getHeaders() }).pipe(
      tap((nuevaPublicacion) => {
        this.estadoApi.agregarNuevaPublicacion(nuevaPublicacion);
      })
    );
  }
}
