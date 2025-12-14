import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';
import { AppEstado, UsuarioLogueado } from '../interfaces/estado.interface';
import { AuthService } from './auth/AuthService';
import { Router } from '@angular/router';

function getUserIdFromStorage(): number | null {
  const userId = localStorage.getItem('user_id');
  return userId ? parseInt(userId, 10) : null;
}

// 1. Definición del Estado Inicial
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
  // EL ESTADO PRIVADO (fuente de verdad)
  private estadoSubject = new BehaviorSubject<AppEstado>(ESTADO_INICIAL);

  // EL ESTADO PÚBLICO (para que los componentes se suscriban)
  public readonly estado$: Observable<AppEstado> = this.estadoSubject.asObservable();

  constructor() {
    this.inicializarEstado();
  }

  /** Obtiene el valor actual del estado (solo para uso interno) */
  private get estadoActual(): AppEstado {
    return this.estadoSubject.value;
  }

  /**
   * Actualiza el estado global de forma inmutable, combinando el estado actual con los nuevos datos.
   * @param nuevosDatos - Objeto parcial (Partial<AppEstado>) con los campos a modificar.
   */
  public actualizarEstado(nuevosDatos: Partial<AppEstado>): void {
    const nuevoEstado: AppEstado = {
      ...this.estadoActual,
      ...nuevosDatos,
    };
    this.estadoSubject.next(nuevoEstado);
  }

  public setUsuario(usuario: UsuarioLogueado | null): void {
    this.actualizarEstado({
      usuario: usuario,
      estaLogueado: usuario !== null,
    });
  }

  public cerrarSesion(): void {
    // 🚀 LIMPIEZA CLAVE: Remover ambas claves
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');

    this.setUsuario(null); // Limpia el estado interno

    // Redirigir a login
    this.router.navigate(['/login']);
  }
  /**
   * Intenta cargar el usuario del localStorage al iniciar la aplicación.
   */
  public inicializarEstado(): void {
    const userId = getUserIdFromStorage(); // Obtiene el ID guardado
    const token = localStorage.getItem('jwt_token');

    // Solo procede si AMBOS existen (Token y ID son necesarios)
    if (userId && token) {
      console.log('Token y ID encontrados. Intentando cargar datos de usuario...');

      this.authService
        .getUsuarioData(userId)
        .pipe(
          tap((userData) => {
            // Éxito: Cargar el usuario en el estado
            this.setUsuario(userData);
            console.log('Sesión cargada exitosamente.');
          }),
          catchError((error) => {
            // Error (Token inválido, expirado, o ID incorrecto): Limpiar sesión
            console.error('Error al obtener datos de usuario. Limpiando sesión...', error);
            // Llama a this.cerrarSesion() para limpiar localStorage y el estado
            this.cerrarSesion();
            return of(null);
          })
        )
        .subscribe();
    } else {
      // No hay datos suficientes, asegura que el estado esté limpio
      this.setUsuario(null);
      // Asegura que no quede un token sin ID (o viceversa)
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_id');
    }
  }
}
