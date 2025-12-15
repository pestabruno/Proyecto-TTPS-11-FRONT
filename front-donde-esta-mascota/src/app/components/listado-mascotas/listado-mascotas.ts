import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Publicacion } from '../../interfaces/estado.interface';
import { PublicacionService } from '../../services/publicacion/publicacion.service';

@Component({
  selector: 'app-listado-mascotas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listado-mascotas.html',
  styleUrls: ['./listado-mascotas.css']
})
export class ListadoMascotasComponent implements OnInit, AfterViewInit, OnDestroy {

  // Datos completos
  publicaciones: Publicacion[] = [];
  
  Math = Math;
  // Paginacion
  publicacionesPaginadas: Publicacion[] = [];
  paginaActual: number = 1;
  itemsPorPagina: number = 10; // Ajustá este número según prefieras
  totalPaginas: number = 0;
  
  // Estados
  cargando: boolean = true;
  error: string | null = null;
  
  private routerSubscription?: Subscription;

  constructor(
    private publicacionService: PublicacionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
        this.calcularPaginacion();
        this.actualizarPagina();
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

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.publicaciones.length / this.itemsPorPagina);
  }

  actualizarPagina(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.publicacionesPaginadas = this.publicaciones.slice(inicio, fin);
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    
    this.paginaActual = pagina;
    this.actualizarPagina();
    
    // Scroll al top de la página
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

  // Helper para generar array de números de página
  getPaginasArray(): number[] {
    const paginas: number[] = [];
    const maxPaginasVisibles = 5;
    
    let inicio = Math.max(1, this.paginaActual - Math.floor(maxPaginasVisibles / 2));
    let fin = Math.min(this.totalPaginas, inicio + maxPaginasVisibles - 1);
    
    // Ajustar inicio si estamos cerca del final
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
}