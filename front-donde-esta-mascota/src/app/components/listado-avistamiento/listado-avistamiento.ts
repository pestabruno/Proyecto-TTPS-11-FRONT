import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Avistamiento } from '../../interfaces/estado.interface';
import { AvistamientoService } from '../../services/avistamiento/avistamiento.service';
import { AuthService } from '../../services/auth/AuthService';
import { EstadoApiService } from '../../services/estado-api';

interface FiltrosAvistamiento {
  soloMisAvistamientos: boolean;
  provincia: string;
  fechaDesde: string;
  fechaHasta: string;
}

@Component({
  selector: 'app-listado-avistamiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listado-avistamiento.html',
  styleUrls: ['./listado-avistamiento.css'],
})
export class ListadoAvistamientoComponent implements OnInit, OnDestroy {
  private estadoApi = inject(EstadoApiService);
  private avistamientoService = inject(AvistamientoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  avistamientos: Avistamiento[] = [];
  avistamientosFiltrados: Avistamiento[] = [];
  avistamientosPaginados: Avistamiento[] = [];

  paginaActual: number = 1;
  itemsPorPagina: number = 12;
  totalPaginas: number = 0;
  cargando: boolean = true;
  error: string | null = null;
  mostrarFiltros: boolean = false;
  Math = Math;

  filtros: FiltrosAvistamiento = {
    soloMisAvistamientos: false,
    provincia: '',
    fechaDesde: '',
    fechaHasta: '',
  };
  filtrosTemporales: FiltrosAvistamiento = { ...this.filtros };

  private estadoSub?: Subscription;
  private usuarioIdActual: number | null = null;

  ngOnInit(): void {
    this.usuarioIdActual = this.authService.getUsuarioId();

    this.estadoSub = this.estadoApi.estado$.subscribe((estado) => {
      this.avistamientos = estado.avistamientosGlobales;
      this.cargando = estado.cargandoAvistamientos;
      this.error = estado.errorAvistamientos;
      this.aplicarFiltros();
      this.cdr.detectChanges();
    });

    // Cargar avistamientos
    this.avistamientoService.obtenerTodos().subscribe({
      error: (err) => {
        console.error('Error al cargar avistamientos:', err);
        this.estadoApi.actualizarEstado({
          cargandoAvistamientos: false,
          errorAvistamientos: 'Error al cargar avistamientos'
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.estadoSub?.unsubscribe();
  }

  aplicarFiltros(): void {
    this.avistamientosFiltrados = this.avistamientos.filter((avist) => {
      if (this.filtros.soloMisAvistamientos && avist.reportante.id !== this.usuarioIdActual) {
        return false;
      }

      if (this.filtros.provincia && avist.provincia !== this.filtros.provincia) {
        return false;
      }

      if (this.filtros.fechaDesde && avist.fecha < this.filtros.fechaDesde) {
        return false;
      }

      if (this.filtros.fechaHasta && avist.fecha > this.filtros.fechaHasta) {
        return false;
      }

      return true;
    });

    this.avistamientosFiltrados.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`).getTime();
      const fechaB = new Date(`${b.fecha}T${b.hora}`).getTime();
      return fechaB - fechaA;
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
    this.filtros = {
      soloMisAvistamientos: false,
      provincia: '',
      fechaDesde: '',
      fechaHasta: '',
    };
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
      this.filtros.soloMisAvistamientos ||
      this.filtros.provincia !== '' ||
      this.filtros.fechaDesde !== '' ||
      this.filtros.fechaHasta !== ''
    );
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.avistamientosFiltrados.length / this.itemsPorPagina);
  }

  actualizarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    this.avistamientosPaginados = this.avistamientosFiltrados.slice(
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
    this.router.navigate(['/avistamiento', id]);
  }

  formatearFechaHora(fecha: string, hora: string): string {
    try {
      const fechaObj = new Date(`${fecha}T${hora}`);
      return fechaObj.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return `${fecha} ${hora}`;
    }
  }

  reintentar(): void {
    this.avistamientoService.obtenerTodos().subscribe();
  }
}