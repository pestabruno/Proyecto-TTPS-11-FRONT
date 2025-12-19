import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { AppEstado, Publicacion, UsuarioLogueado } from '../interfaces/estado.interface';
import { AuthService } from './auth/AuthService';
import { Router } from '@angular/router';
import { GeorefService } from './geoRef/geoRef.service';

function getUserIdFromStorage(): number | null {
  const userId = localStorage.getItem('user_id');
  return userId ? parseInt(userId, 10) : null;
}

const ESTADO_INICIAL: AppEstado = {
  usuario: null,
  estaLogueado: false,
  publicacionesGlobales: [],
  cargandoPublicaciones: false,
  errorPublicaciones: null,
  avistamientosGlobales: [],
  cargandoAvistamientos: false,
  errorAvistamientos: null,
};

@Injectable({
  providedIn: 'root',
})
export class EstadoApiService {
  private authService = inject(AuthService);
  private router = inject(Router);
  private georefService = inject(GeorefService);

  private estadoSubject = new BehaviorSubject<AppEstado>(ESTADO_INICIAL);
  public readonly estado$: Observable<AppEstado> = this.estadoSubject.asObservable();

  constructor() {
    // Solo inicializamos la sesión del usuario
    this.inicializarEstado();
  }

  private get estadoActual(): AppEstado {
    return this.estadoSubject.value;
  }

  /** Obtiene el valor actual sin suscribirse (útil para lógica rápida) */
  public obtenerValorActual(): AppEstado {
    return this.estadoActual;
  }

  public actualizarEstado(nuevosDatos: Partial<AppEstado>): void {
    this.estadoSubject.next({
      ...this.estadoActual,
      ...nuevosDatos,
    });
  }

  public setUsuario(usuario: UsuarioLogueado | null): void {
    this.actualizarEstado({
      usuario: usuario,
      estaLogueado: usuario !== null,
    });

    if (usuario) {
      this.enriquecerUsuarioConCoordenadas(usuario);
    }
  }

  private enriquecerUsuarioConCoordenadas(usuario: UsuarioLogueado): void {
    const { localidad, provincia } = usuario;

    if (!localidad || !provincia) return;

    this.georefService.obtenerCoordenadasUsuario(localidad, provincia).subscribe({
      next: (res) => {
        // El endpoint /localidades devuelve un array 'localidades'
        if (res.localidades && res.localidades.length > 0) {
          // Extraemos el centroide (lat y lon)
          const { lat, lon } = res.localidades[0].centroide;

          const usuarioActualizado = {
            ...usuario,
            latitud: lat,
            longitud: lon,
          };

          this.actualizarEstado({ usuario: usuarioActualizado });
          console.log(`Ubicación de centroide obtenida para: ${localidad}`);
        }
      },
      error: (err) => console.error('Error al obtener centroide del usuario:', err),
    });
  }
  public cerrarSesion(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    this.setUsuario(null);
    this.router.navigate(['/login']);
  }

  public inicializarEstado(): void {
    const userId = getUserIdFromStorage();
    const token = localStorage.getItem('jwt_token');

    if (userId && token) {
      this.authService
        .getUsuarioData(userId)
        .pipe(
          tap((userData) => this.setUsuario(userData)),
          catchError(() => {
            this.cerrarSesion();
            return of(null);
          })
        )
        .subscribe();
    }
  }

  // --- GESTIÓN DE PUBLICACIONES ---
  public setPublicaciones(publicaciones: Publicacion[]): void {
    // 1. Guardamos la lista básica
    this.actualizarEstado({ publicacionesGlobales: publicaciones });

    // 2. Disparamos Georef para cada una que no tenga coordenadas
    publicaciones.forEach((pub) => {
      if (!pub.latitud) {
        this.enriquecerConCoordenadas(pub);
      }
    });
  }

  public agregarNuevaPublicacion(nueva: Publicacion): void {
    const listaActualizada = [...this.estadoActual.publicacionesGlobales, nueva];
    this.actualizarEstado({ publicacionesGlobales: listaActualizada });
    if (!nueva.latitud) this.enriquecerConCoordenadas(nueva);
  }

  private enriquecerConCoordenadas(pub: Publicacion): void {
    this.georefService
      .obtenerCoordenadas(pub.calle, pub.altura, pub.localidad, pub.provincia)
      .subscribe((res) => {
        if (res.direcciones?.length > 0) {
          const { lat, lon } = res.direcciones[0].ubicacion;
          this.actualizarCoordenadaPublicacion(pub.id, lat, lon);
        }
      });
  }

  private actualizarCoordenadaPublicacion(id: number, lat: number, lon: number): void {
    const actualizadas = this.estadoActual.publicacionesGlobales.map((p) =>
      p.id === id ? { ...p, latitud: lat, longitud: lon } : p
    );
    this.actualizarEstado({ publicacionesGlobales: actualizadas });
  }
}
