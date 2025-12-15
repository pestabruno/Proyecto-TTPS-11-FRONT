import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Publicacion } from '../../interfaces/estado.interface';
import { PublicacionService } from '../../services/publicacion/publicacion.service';
import { AuthService } from '../../services/auth/AuthService';

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
  styleUrls: ['./listado-mascotas.css']
})
export class ListadoMascotasComponent implements OnInit, AfterViewInit, OnDestroy {

  publicaciones: Publicacion[] = [];
  publicacionesFiltradas: Publicacion[] = [];
  
  Math = Math;
  
  publicacionesPaginadas: Publicacion[] = [];
  paginaActual: number = 1;
  itemsPorPagina: number = 12;
  totalPaginas: number = 0;
  
  cargando: boolean = true;
  error: string | null = null;
  
  mostrarFiltros: boolean = false;
  
  // ✅ NUEVO: Filtros temporales (lo que el usuario está seleccionando)
  filtrosTemporales: Filtros = {
    soloMisPublicaciones: false,
    estado: '',
    provincia: '',
    tamanio: ''
  };
  
  // ✅ Filtros aplicados (los que realmente están activos)
  filtros: Filtros = {
    soloMisPublicaciones: false,
    estado: '',
    provincia: '',
    tamanio: ''
  };
  
  private routerSubscription?: Subscription;
  private usuarioIdActual: number | null = null;

  constructor(
    private publicacionService: PublicacionService,
    private AuthService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuarioIdActual = this.AuthService.getUsuarioId();
    this.cargarPublicaciones();

    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        if (event.url === '/listado' || event.url === '/') {
          this.cargarPublicaciones();
        }
      });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  cargarPublicaciones(): void {
    this.cargando = true;
    this.error = null;

    this.publicacionService.obtenerTodas().subscribe({
      next: (data) => {
        this.publicaciones = data;
        this.aplicarFiltros();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error al cargar las publicaciones';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ✅ MODIFICADO: Solo aplica los filtros guardados, no los temporales
  aplicarFiltros(): void {
    this.publicacionesFiltradas = this.publicaciones.filter(pub => {
      if (this.filtros.soloMisPublicaciones) {
        if (!this.usuarioIdActual || pub.autor.id !== this.usuarioIdActual) {
          return false;
        }
      }

      if (this.filtros.estado && pub.estado !== this.filtros.estado) {
        return false;
      }

      if (this.filtros.provincia && pub.provincia !== this.filtros.provincia) {
        return false;
      }

      if (this.filtros.tamanio && pub.tamanio !== this.filtros.tamanio) {
        return false;
      }

      return true;
    });

    this.paginaActual = 1;
    this.calcularPaginacion();
    this.actualizarPagina();
  }

  // ✅ NUEVO: Guardar filtros temporales y aplicarlos
  guardarFiltros(): void {
    // Copiar los filtros temporales a los filtros reales
    this.filtros = { ...this.filtrosTemporales };
    
    // Aplicar los filtros
    this.aplicarFiltros();
    
    // Cerrar el modal
    this.toggleModal();
  }

  // ✅ MODIFICADO: Limpiar tanto temporales como aplicados
  limpiarFiltros(): void {
    this.filtrosTemporales = {
      soloMisPublicaciones: false,
      estado: '',
      provincia: '',
      tamanio: ''
    };
    
    this.filtros = {
      soloMisPublicaciones: false,
      estado: '',
      provincia: '',
      tamanio: ''
    };
    
    this.aplicarFiltros();
    this.toggleModal();
  }

  // ✅ MODIFICADO: Al abrir el modal, copiar filtros actuales a temporales
  toggleModal(): void {
    if (!this.mostrarFiltros) {
      // Al abrir, copiar los filtros actuales a temporales
      this.filtrosTemporales = { ...this.filtros };
    }
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  hayFiltrosActivos(): boolean {
    return this.filtros.soloMisPublicaciones ||
           this.filtros.estado !== '' ||
           this.filtros.provincia !== '' ||
           this.filtros.tamanio !== '';
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.publicacionesFiltradas.length / this.itemsPorPagina);
  }

  actualizarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.publicacionesPaginadas = this.publicacionesFiltradas.slice(inicio, fin);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    
    this.paginaActual = pagina;
    this.actualizarPagina();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.irAPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.irAPagina(this.paginaActual + 1);
    }
  }

  getPaginasArray(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 5;
    
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasVisibles / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);
    
    if (fin - inicio < maxPaginasVisibles - 1) {
      inicio = Math.max(1, fin - maxPaginasVisibles + 1);
    }
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  verDetalle(id: number): void {
    this.router.navigate(['/publicacion', id]);
  }

  formatearEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'PERDIDO_PROPIO': 'Perdido (propio)',
      'PERDIDO_AJENO': 'Perdido (ajeno)',
      'RECUPERADO': 'Recuperado'
    };
    return estados[estado] || estado;
  }
}