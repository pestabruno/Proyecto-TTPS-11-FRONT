import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Publicacion } from '../../interfaces/estado.interface';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { AuthService } from '../../services/auth/AuthService';
import { EstadoApiService } from '../../services/estado-api';

interface Filtros {
  soloMisPublicaciones: boolean;
  estado: string;
  provincia: string;
  tamanio: string;
}

@Component({
  selector: 'app-listado-mascotas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-mascotas.html',
  styleUrls: ['./listado-mascotas.css'],
})
export class ListadoMascotasComponent implements OnInit, OnDestroy {
  private estadoApi = inject(EstadoApiService);
  private publicacionService = inject(PublicacionService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  publicaciones: Publicacion[] = [];
  publicacionesFiltradas: Publicacion[] = [];
  publicacionesPaginadas: Publicacion[] = [];

  paginaActual: number = 1;
  itemsPorPagina: number = 12;
  totalPaginas: number = 0;
  cargando: boolean = true;
  error: string | null = null;
  mostrarFiltros: boolean = false;
  Math = Math;

  filtros: Filtros = { soloMisPublicaciones: false, estado: '', provincia: '', tamanio: '' };
  filtrosTemporales: Filtros = { ...this.filtros };

  private estadoSub?: Subscription;
  private usuarioIdActual: number | null = null;

  ngOnInit(): void {
    this.usuarioIdActual = this.authService.getUsuarioId();

    this.estadoSub = this.estadoApi.estado$.subscribe((estado) => {
      this.publicaciones = estado.publicacionesGlobales;
      this.cargando = estado.cargandoPublicaciones;
      this.error = estado.errorPublicaciones;
      this.aplicarFiltros();
      this.cdr.detectChanges();
    });

    if (this.publicaciones.length === 0) {
      this.publicacionService.obtenerTodas().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.estadoSub?.unsubscribe();
  }

  aplicarFiltros(): void {
    this.publicacionesFiltradas = this.publicaciones.filter((pub) => {
      if (this.filtros.soloMisPublicaciones && pub.autor.id !== this.usuarioIdActual) return false;
      if (this.filtros.estado && pub.estado !== this.filtros.estado) return false;
      if (this.filtros.provincia && pub.provincia !== this.filtros.provincia) return false;
      if (this.filtros.tamanio && pub.tamanio !== this.filtros.tamanio) return false;
      return true;
    });
    this.paginaActual = 1;
    this.calcularPaginacion();
    this.actualizarPagina();
  }

  guardarFiltros(): void {
    this.filtros = { ...this.filtrosTemporales };
    this.aplicarFiltros();
    this.toggleModal();
  }

  limpiarFiltros(): void {
    this.filtros = { soloMisPublicaciones: false, estado: '', provincia: '', tamanio: '' };
    this.filtrosTemporales = { ...this.filtros };
    this.aplicarFiltros();
    this.toggleModal();
  }

  toggleModal(): void {
    if (!this.mostrarFiltros) {
      this.filtrosTemporales = { ...this.filtros };
    }
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  hayFiltrosActivos(): boolean {
    return (
      this.filtros.soloMisPublicaciones ||
      this.filtros.estado !== '' ||
      this.filtros.provincia !== '' ||
      this.filtros.tamanio !== ''
    );
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.publicacionesFiltradas.length / this.itemsPorPagina);
  }

  actualizarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.publicacionesPaginadas = this.publicacionesFiltradas.slice(
      inicio,
      inicio + this.itemsPorPagina
    );
  }

  irAPagina(p: number): void {
    if (p < 1 || p > this.totalPaginas) return;
    this.paginaActual = p;
    this.actualizarPagina();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginaAnterior(): void {
    this.irAPagina(this.paginaActual - 1);
  }

  paginaSiguiente(): void {
    this.irAPagina(this.paginaActual + 1);
  }

  getPaginasArray(): number[] {
    const paginas: number[] = [];
    const maxVisibles = 5;
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxVisibles / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxVisibles - 1);

    if (fin - inicio < maxVisibles - 1) {
      inicio = Math.max(1, fin - maxVisibles + 1);
    }

    for (let i = inicio; i <= fin; i++) {
      if (i > 0) paginas.push(i);
    }
    return paginas;
  }

  verDetalle(id: number): void {
    this.router.navigate(['/publicacion', id]);
  }

  formatearEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      PERDIDO_PROPIO: 'Perdido (propio)',
      PERDIDO_AJENO: 'Perdido (ajeno)',
      RECUPERADO: 'Recuperado',
    };
    return estados[estado] || estado;
  }
}
