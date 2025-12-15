import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Publicacion } from '../../interfaces/estado.interface';
import { PublicacionService } from '../../services/publicacion/publicacion.service';

@Component({
  selector: 'app-detalle-publicacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-publicacion.html',
  styleUrls: ['./detalle-publicacion.css']
})
export class DetallePublicacionComponent implements OnInit {
  
  publicacion: Publicacion | null = null;
  cargando: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicacionService: PublicacionService,
    private cdr: ChangeDetectorRef  // <-- Agregar esto
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID obtenido de la URL:', id);
    
    if (id) {
      this.cargarPublicacion(id);
    } else {
      this.error = 'ID de publicación inválido';
      this.cargando = false;
    }
  }

  cargarPublicacion(id: number): void {
    console.log('Cargando publicación con ID:', id);
    this.cargando = true;
    this.error = null;

    this.publicacionService.obtenerPorId(id).subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);
        this.publicacion = data;
        this.cargando = false;
        this.cdr.detectChanges();  // <-- Forzar detección de cambios
        console.log('Estado después de cargar:', {
          publicacion: this.publicacion,
          cargando: this.cargando
        });
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        this.error = 'Error al cargar la publicación';
        this.cargando = false;
        this.cdr.detectChanges();  // <-- Forzar detección de cambios
      }
    });
  }

  volver(): void {
    this.router.navigate(['/listado']);
  }

  agregarAvistamiento(): void {
    if (this.publicacion) {
      console.log('Agregar avistamiento para publicación:', this.publicacion.id);
      alert('Funcionalidad de agregar avistamiento - Próximamente');
    }
  }
}