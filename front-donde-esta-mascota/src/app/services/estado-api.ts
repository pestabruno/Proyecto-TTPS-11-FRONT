import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppEstado, UsuarioLogueado } from '../interfaces/estado.interface';

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
  // EL ESTADO PRIVADO (fuente de verdad)
  private estadoSubject = new BehaviorSubject<AppEstado>(ESTADO_INICIAL);

  // EL ESTADO PÚBLICO (para que los componentes se suscriban)
  public readonly estado$: Observable<AppEstado> = this.estadoSubject.asObservable();

  constructor() {}

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
      ...this.estadoActual, // Copia el estado anterior
      ...nuevosDatos, // Sobrescribe los campos nuevos
    };
    this.estadoSubject.next(nuevoEstado); // Emite el nuevo estado a todos los suscriptores
  }

  public setUsuario(usuario: UsuarioLogueado | null): void {
    this.actualizarEstado({
      usuario: usuario,
      estaLogueado: usuario !== null,
    });
  }

  public cerrarSesion(): void {
    this.actualizarEstado({
      usuario: null,
      estaLogueado: false,
      // Opcional: limpiar también publicaciones y avistamientos al cerrar sesión
    });
  }
}
