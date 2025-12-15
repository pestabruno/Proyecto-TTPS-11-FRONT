import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avistamiento, Publicacion } from '../../interfaces/estado.interface';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root'
})
export class AvistamientoService {

  private apiUrl = 'http://localhost:8080/api/avistamientos';
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

    obtenerTodos(): Observable<Avistamiento[]> {
        return this.http.get<Avistamiento[]>(this.apiUrl, { headers: this.getHeaders() });
    }



    //ver porque en el back creo que no mandamos id 
    crearAvistamiento(reportanteId: number, avistamiento: any): Observable<any> {
        const url = `${this.apiUrl}/${reportanteId}`;
        return this.http.post<any>(url, avistamiento, { headers: this.getHeaders() });
    }

}