import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publicacion } from '../../interfaces/estado.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  private apiUrl = 'http://localhost:8080/api/publicaciones';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) { }

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
    return this.http.get<Publicacion[]>(this.apiUrl, { headers: this.getHeaders() });
  }


  obtenerPorId(id: number): Observable<Publicacion> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Publicacion>(url, { headers: this.getHeaders() });
  }


eliminar(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
}



editar(id:number, publicacion: Publicacion): Observable<Publicacion> {
  return this.http.put<Publicacion>(`${this.apiUrl}/${id}`, publicacion, { headers: this.getHeaders() });
}

}