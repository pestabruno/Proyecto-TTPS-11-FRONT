import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Publicacion } from '../../interfaces/estado.interface';

@Injectable({
  providedIn: 'root'
})
export class PublicacionService {

  private apiUrl = 'http://localhost:8080/api/publicaciones';

  constructor(private http: HttpClient) { }

  obtenerTodas(): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(this.apiUrl);
  }

  obtenerPorAutor(autorId: number): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(`${this.apiUrl}/autor/${autorId}`);
  }

  crear(autorId: number, publicacion: any): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${this.apiUrl}/${autorId}`, publicacion);
  }

  editar(id: number, publicacion: any): Observable<Publicacion> {
    return this.http.put<Publicacion>(`${this.apiUrl}/${id}`, publicacion);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}