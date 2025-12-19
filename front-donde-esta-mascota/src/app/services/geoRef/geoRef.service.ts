import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeorefService {
  private readonly API_URL = 'https://apis.datos.gob.ar/georef/api/direcciones';
  private http = inject(HttpClient);

  obtenerCoordenadas(
    calle: string,
    altura: string,
    localidad: string,
    provincia: string
  ): Observable<any> {
    // 1. Preparamos los parámetros tal cual el ejemplo de la documentación
    // Para La Plata, el departamento se llama "La Plata".
    // Usamos HttpParams para que Angular se encargue de los espacios y caracteres
    const params = new HttpParams()
      .set('direccion', `${calle} ${altura}`)
      .set('departamento', localidad)
      .set('provincia', provincia)
      .set('max', '1');

    return this.http.get(this.API_URL, { params });
  }

  private readonly LOCALIDADES_URL = 'https://apis.datos.gob.ar/georef/api/localidades';

  obtenerCoordenadasUsuario(localidad: string, provincia: string): Observable<any> {
    const params = new HttpParams()
      .set('nombre', localidad)
      .set('provincia', provincia)
      .set('max', '1');

    return this.http.get(this.LOCALIDADES_URL, { params });
  }
}
